package in.sih.vaspattribution.engine;

import in.sih.vaspattribution.blockchain.dto.BlockchainTransaction;
import in.sih.vaspattribution.blockchain.dto.TransactionQuery;
import in.sih.vaspattribution.blockchain.provider.BlockchainProvider;
import in.sih.vaspattribution.blockchain.provider.BlockchainProviderRegistry;
import in.sih.vaspattribution.engine.risk.RiskScorer;
import in.sih.vaspattribution.entity.entity.EntityAddress;
import in.sih.vaspattribution.entity.repository.EntityAddressRepository;
import in.sih.vaspattribution.investigation.entity.Finding;
import in.sih.vaspattribution.finding.repository.FindingRepository;
import in.sih.vaspattribution.investigation.entity.Investigation;
import in.sih.vaspattribution.investigation.entity.InvestigationEdge;
import in.sih.vaspattribution.investigation.entity.InvestigationNode;
import in.sih.vaspattribution.investigation.repository.InvestigationEdgeRepository;
import in.sih.vaspattribution.investigation.repository.InvestigationNodeRepository;
import in.sih.vaspattribution.investigation.repository.InvestigationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttributionEngine {

    private final java.util.Map<UUID, java.util.List<InvestigationPath>> attributionCache = new java.util.concurrent.ConcurrentHashMap<>();

    private final InvestigationRepository investigationRepository;
    private final InvestigationNodeRepository investigationNodeRepository;
    private final InvestigationEdgeRepository investigationEdgeRepository;
    private final EntityAddressRepository entityAddressRepository;
    private final FindingRepository findingRepository;
    private final BlockchainProviderRegistry providerRegistry;
    private final RiskScorer riskScorer;

    @Value("${vaspattribution.engine.max-hops:5}")
    private int defaultMaxHops;

    @Value("${vaspattribution.engine.max-nodes:5000}")
    private int maxNodes;

    @Value("${vaspattribution.engine.max-edges:10000}")
    private int maxEdges;

    @Value("${vaspattribution.engine.timeout-ms:300000}") // 5 minutes
    private long timeoutMs;

    @Async("taskExecutor")
    public void runInvestigation(UUID investigationId) {
        log.info("Starting investigation {}", investigationId);
        long startTime = System.currentTimeMillis();

        Investigation investigation = investigationRepository.findById(investigationId).orElse(null);
        if (investigation == null) {
            log.error("Investigation {} not found", investigationId);
            return;
        }

        try {
            investigation.setStatus("RUNNING");
            investigationRepository.save(investigation);

            List<InvestigationNode> startNodes = investigationNodeRepository.findByInvestigationId(investigationId);
            if (startNodes.isEmpty()) {
                throw new IllegalStateException("No starting node for investigation");
            }

            InvestigationNode startNode = startNodes.get(0);
            BlockchainProvider provider = providerRegistry.getProvider(startNode.getChain());

            Queue<InvestigationPath> queue = new LinkedList<>();
            java.util.Map<String, Integer> inDegrees = new java.util.HashMap<>();
            queue.add(new InvestigationPath(startNode, new ArrayList<>()));

            Set<String> visited = new HashSet<>();
            visited.add(startNode.getChain() + ":" + startNode.getAddress());

            int nodeCount = 1;
            int edgeCount = 0;
            boolean vaspFound = false;
            int maxHops = investigation.getMaxHops() != null ? investigation.getMaxHops() : defaultMaxHops;

            List<InvestigationPath> vaspCandidates = new ArrayList<>();

            while (!queue.isEmpty() && nodeCount < maxNodes && edgeCount < maxEdges) {
                // Timeout check
                if (System.currentTimeMillis() - startTime > timeoutMs) {
                    log.warn("Investigation {} timed out", investigationId);
                    investigation.setErrorMessage("Timeout reached");
                    break;
                }

                // Cancellation check
                Investigation currentStatus = investigationRepository.findById(investigationId).orElse(null);
                if (currentStatus != null && "CANCELLED".equals(currentStatus.getStatus())) {
                    log.info("Investigation {} was cancelled", investigationId);
                    return;
                }

                InvestigationPath currentPath = queue.poll();
                InvestigationNode current = currentPath.node;

                if (current.getHop() >= maxHops) {
                    continue; // Skip processing neighbors if we reached max hops
                }

                TransactionQuery query = TransactionQuery.builder()
                        .direction("OUT")
                        .page(1)
                        .limit(50)
                        .build();

                List<BlockchainTransaction> txs = provider.getTransactions(current.getAddress(), query);
                
                for (BlockchainTransaction tx : txs) {
                    if (nodeCount >= maxNodes || edgeCount >= maxEdges) break;

                    String toIdentity = tx.getChain() + ":" + tx.getToAddress();
                    inDegrees.put(tx.getToAddress(), inDegrees.getOrDefault(tx.getToAddress(), 0) + 1);
                    boolean isAlreadyVisited = visited.contains(toIdentity);

                    if (tx.getValue() != null && tx.getValue().compareTo(new java.math.BigDecimal("100000")) > 0) {
                        createFinding(investigation, "LARGE_TRANSFER", "Large Transfer Detected", 
                                "Transfer of " + tx.getValue() + " " + tx.getAsset(), "MEDIUM", "tx: " + tx.getTxHash());
                    }

                    // Always get/create node and edge to preserve the complete graph
                    InvestigationNode toNode = getOrCreateNode(investigation, tx.getChain(), tx.getToAddress(), current.getHop() + 1);
                    if (toNode.getRiskScore() == null) {
                        nodeCount++;
                    }

                    InvestigationEdge edge = createEdge(investigation, current, toNode, tx);
                    edgeCount++;
                    
                    List<InvestigationEdge> newPathEdges = new ArrayList<>(currentPath.edges);
                    if (edge != null) {
                        newPathEdges.add(edge);
                    }

                    // RAPID_FORWARDING check
                    if (!newPathEdges.isEmpty() && newPathEdges.size() >= 2) {
                        InvestigationEdge prevEdge = newPathEdges.get(newPathEdges.size() - 2);
                        if (prevEdge.getTimestamp() != null && tx.getTimestamp() != null) {
                            long diffHours = java.time.Duration.between(prevEdge.getTimestamp(), tx.getTimestamp()).toHours();
                            if (diffHours >= 0 && diffHours < 1) {
                                createFinding(investigation, "RAPID_FORWARDING", "Rapid Forwarding Detected",
                                        "Funds forwarded in less than 1 hour", "HIGH", "tx: " + tx.getTxHash());
                            }
                        }
                    }

                    if (!isAlreadyVisited) {
                        visited.add(toIdentity);
                        int score = riskScorer.calculateRiskScore(toNode, newPathEdges);
                        toNode.setRiskScore(score);
                        investigationNodeRepository.save(toNode);

                        InvestigationPath newPath = new InvestigationPath(toNode, newPathEdges);

                        if (score > 80) {
                            createFinding(investigation, "HIGH_RISK_COUNTERPARTY", "High Risk Counterparty",
                                    "Counterparty risk score > 80", "HIGH", "Node: " + toNode.getAddress());
                        }

                        if (toNode.getEntity() != null) {
                            String type = toNode.getEntity().getEntityType();
                            if ("EXCHANGE".equalsIgnoreCase(type) || "VASP".equalsIgnoreCase(type)) {
                                vaspCandidates.add(newPath);
                            } else if ("MIXER".equalsIgnoreCase(type)) {
                                createFinding(investigation, "MIXER_EXPOSURE", "Mixer Exposure", 
                                        "Path touched a Mixer", "CRITICAL", "Node: " + toNode.getAddress());
                            } else if ("BRIDGE".equalsIgnoreCase(type)) {
                                createFinding(investigation, "BRIDGE_USAGE", "Bridge Usage", 
                                        "Path touched a Bridge", "MEDIUM", "Node: " + toNode.getAddress());
                            }
                        } 
                        
                        // Add to queue to keep searching if not VASP
                        if (toNode.getEntity() == null || (!"EXCHANGE".equalsIgnoreCase(toNode.getEntity().getEntityType()) && !"VASP".equalsIgnoreCase(toNode.getEntity().getEntityType()))) {
                            queue.add(newPath);
                        }
                    }
                }
                
                if (txs.size() > 10) {
                    createFinding(investigation, "FAN_OUT", "Fan Out Behavior", 
                            "Address " + current.getAddress() + " sent to " + txs.size() + " addresses", "LOW", "Node: " + current.getAddress());
                }
            }
            
            for (java.util.Map.Entry<String, Integer> entry : inDegrees.entrySet()) {
                if (entry.getValue() > 5) {
                    createFinding(investigation, "FAN_IN", "Fan In Behavior", "Address " + entry.getKey() + " received from " + entry.getValue() + " transactions", "LOW", "Node: " + entry.getKey());
                }
            }
            
            // Candidate Ordering and finding creation
            if (!vaspCandidates.isEmpty()) {
                vaspFound = true;
                // Order by smallest hop_count, then confidence/amount as tie-breakers
                java.util.List<String> addresses = vaspCandidates.stream().map(p -> p.node.getAddress()).collect(java.util.stream.Collectors.toList());
                java.util.List<in.sih.vaspattribution.entity.entity.EntityAddress> entityAddresses = entityAddressRepository.findByAddressIn(addresses);
                java.util.Map<String, in.sih.vaspattribution.entity.entity.EntityAddress> eaMap = entityAddresses.stream().collect(java.util.stream.Collectors.toMap(in.sih.vaspattribution.entity.entity.EntityAddress::getAddress, e -> e, (e1, e2) -> e1));
                vaspCandidates.sort((a, b) -> {
                    int hopCompare = Integer.compare(a.node.getHop(), b.node.getHop());
                    if (hopCompare != 0) return hopCompare;
                    in.sih.vaspattribution.entity.entity.EntityAddress eaA = eaMap.get(a.node.getAddress());
                    in.sih.vaspattribution.entity.entity.EntityAddress eaB = eaMap.get(b.node.getAddress());
                    int eqA = eaA != null && eaA.getSource() != null ? 1 : 0;
                    int eqB = eaB != null && eaB.getSource() != null ? 1 : 0;
                    if (eqA != eqB) return Integer.compare(eqB, eqA);
                    double confA = eaA != null && eaA.getConfidence() != null ? eaA.getConfidence() : 0.0;
                    double confB = eaB != null && eaB.getConfidence() != null ? eaB.getConfidence() : 0.0;
                    if (Double.compare(confA, confB) != 0) return Double.compare(confB, confA);
                    java.math.BigDecimal amountA = java.math.BigDecimal.ZERO;
                    if (!a.edges.isEmpty()) {
                        java.math.BigDecimal val = a.edges.get(a.edges.size() - 1).getAmount();
                        if (val != null) amountA = val;
                    }
                    java.math.BigDecimal amountB = java.math.BigDecimal.ZERO;
                    if (!b.edges.isEmpty()) {
                        java.math.BigDecimal val = b.edges.get(b.edges.size() - 1).getAmount();
                        if (val != null) amountB = val;
                    }
                    return amountB.compareTo(amountA);
                });
                
                attributionCache.put(investigationId, new java.util.ArrayList<>(vaspCandidates));
                for (InvestigationPath candidate : vaspCandidates) {
                    InvestigationNode vaspNode = candidate.node;
                    
                    // Build path reconstruction evidence
                    StringBuilder evidence = new StringBuilder();
                    for (InvestigationEdge edge : candidate.edges) {
                        evidence.append(edge.getSourceAddress()).append(" -> (").append(edge.getTxHash()).append(") -> ");
                    }
                    evidence.append(vaspNode.getAddress());
                    
                    createFinding(investigation, "VASP_EXPOSURE", "VASP Exposure Identified", 
                            "Found VASP " + vaspNode.getEntity().getName() + " at distance " + vaspNode.getHop(), 
                            "CRITICAL", evidence.toString());
                }
            }

            Investigation finalStatus = investigationRepository.findById(investigationId).orElse(investigation);
            if (!"CANCELLED".equals(finalStatus.getStatus())) {
                finalStatus.setNodesFound(nodeCount);
                finalStatus.setEdgesFound(edgeCount);
                finalStatus.setStatus(vaspFound ? "COMPLETED" : (finalStatus.getErrorMessage() != null ? "FAILED" : "COMPLETED"));
                investigationRepository.save(finalStatus);
            }
            log.info("Finished investigation {}", investigationId);

        } catch (Exception e) {
            log.error("Error during investigation {}", investigationId, e);
            Investigation finalStatus = investigationRepository.findById(investigationId).orElse(investigation);
            if (!"CANCELLED".equals(finalStatus.getStatus())) {
                finalStatus.setErrorMessage(e.getMessage());
                finalStatus.setStatus("FAILED");
                investigationRepository.save(finalStatus);
            }
        }
    }
    
    public List<InvestigationPath> getAttributionCandidates(UUID investigationId) {
        Investigation investigation = investigationRepository.findById(investigationId).orElse(null);
        if (investigation == null) return Collections.emptyList();

        List<InvestigationNode> nodes = investigationNodeRepository.findByInvestigationId(investigationId);
        List<InvestigationEdge> edges = investigationEdgeRepository.findByInvestigationId(investigationId);

        InvestigationNode startNode = nodes.stream()
                .filter(n -> n.getAddress().equals(investigation.getStartAddress()))
                .findFirst().orElse(null);
        
        if (startNode == null) return Collections.emptyList();

        Queue<InvestigationPath> queue = new LinkedList<>();
        queue.add(new InvestigationPath(startNode, new ArrayList<>()));
        Set<String> visited = new HashSet<>();
        visited.add(startNode.getAddress());
        
        List<InvestigationPath> vaspCandidates = new ArrayList<>();

        while (!queue.isEmpty()) {
            InvestigationPath currentPath = queue.poll();
            InvestigationNode current = currentPath.node;

            List<InvestigationEdge> outgoing = edges.stream()
                    .filter(e -> e.getSourceAddress().equals(current.getAddress()))
                    .sorted((e1, e2) -> {
                        if (e1.getTimestamp() != null && e2.getTimestamp() != null) {
                            int tCmp = e1.getTimestamp().compareTo(e2.getTimestamp());
                            if (tCmp != 0) return tCmp;
                        }
                        return e1.getTxHash().compareTo(e2.getTxHash());
                    })
                    .toList();

            for (InvestigationEdge edge : outgoing) {
                if (!visited.contains(edge.getTargetAddress())) {
                    visited.add(edge.getTargetAddress());
                    
                    InvestigationNode toNode = nodes.stream()
                            .filter(n -> n.getAddress().equals(edge.getTargetAddress()))
                            .findFirst().orElse(null);
                            
                    if (toNode != null) {
                        List<InvestigationEdge> newPathEdges = new ArrayList<>(currentPath.edges);
                        newPathEdges.add(edge);
                        InvestigationPath newPath = new InvestigationPath(toNode, newPathEdges);
                        
                        if (toNode.getEntity() != null) {
                            String type = toNode.getEntity().getEntityType();
                            if ("EXCHANGE".equalsIgnoreCase(type) || "VASP".equalsIgnoreCase(type)) {
                                vaspCandidates.add(newPath);
                            }
                        }
                        
                        queue.add(newPath);
                    }
                }
            }
        }
        
        java.util.List<String> addresses = vaspCandidates.stream().map(p -> p.node.getAddress()).collect(java.util.stream.Collectors.toList());
                java.util.List<in.sih.vaspattribution.entity.entity.EntityAddress> entityAddresses = entityAddressRepository.findByAddressIn(addresses);
                java.util.Map<String, in.sih.vaspattribution.entity.entity.EntityAddress> eaMap = entityAddresses.stream().collect(java.util.stream.Collectors.toMap(in.sih.vaspattribution.entity.entity.EntityAddress::getAddress, e -> e, (e1, e2) -> e1));
                vaspCandidates.sort((a, b) -> {
                    int hopCompare = Integer.compare(a.node.getHop(), b.node.getHop());
                    if (hopCompare != 0) return hopCompare;
                    in.sih.vaspattribution.entity.entity.EntityAddress eaA = eaMap.get(a.node.getAddress());
                    in.sih.vaspattribution.entity.entity.EntityAddress eaB = eaMap.get(b.node.getAddress());
                    int eqA = eaA != null && eaA.getSource() != null ? 1 : 0;
                    int eqB = eaB != null && eaB.getSource() != null ? 1 : 0;
                    if (eqA != eqB) return Integer.compare(eqB, eqA);
                    double confA = eaA != null && eaA.getConfidence() != null ? eaA.getConfidence() : 0.0;
                    double confB = eaB != null && eaB.getConfidence() != null ? eaB.getConfidence() : 0.0;
                    if (Double.compare(confA, confB) != 0) return Double.compare(confB, confA);
                    java.math.BigDecimal amountA = java.math.BigDecimal.ZERO;
                    if (!a.edges.isEmpty()) {
                        java.math.BigDecimal val = a.edges.get(a.edges.size() - 1).getAmount();
                        if (val != null) amountA = val;
                    }
                    java.math.BigDecimal amountB = java.math.BigDecimal.ZERO;
                    if (!b.edges.isEmpty()) {
                        java.math.BigDecimal val = b.edges.get(b.edges.size() - 1).getAmount();
                        if (val != null) amountB = val;
                    }
                    return amountB.compareTo(amountA);
                });
        return vaspCandidates;
    }

    private InvestigationEdge createEdge(Investigation investigation, InvestigationNode from, InvestigationNode to, BlockchainTransaction tx) {
        Optional<InvestigationEdge> existing = investigationEdgeRepository.findByInvestigationIdAndTxHash(investigation.getId(), tx.getTxHash());
        if (existing.isPresent()) {
            return existing.get();
        }

        InvestigationEdge edge = new InvestigationEdge();
        edge.setId(UUID.randomUUID());
        edge.setInvestigation(investigation);
        edge.setChain(tx.getChain());
        edge.setTxHash(tx.getTxHash());
        edge.setSourceChain(from.getChain());
        edge.setSourceAddress(from.getAddress());
        edge.setTargetChain(to.getChain());
        edge.setTargetAddress(to.getAddress());
        edge.setAmount(tx.getValue());
        edge.setAsset(tx.getAsset());
        edge.setTimestamp(tx.getTimestamp());
        return investigationEdgeRepository.save(edge);
    }
    
    public static class InvestigationPath {
        public InvestigationNode node;
        public List<InvestigationEdge> edges;
        
        public InvestigationPath(InvestigationNode node, List<InvestigationEdge> edges) {
            this.node = node;
            this.edges = edges;
        }
    }

    private void createFinding(in.sih.vaspattribution.investigation.entity.Investigation investigation, String type, String title, String desc, String severity, String evidence) {
        in.sih.vaspattribution.investigation.entity.Finding finding = new in.sih.vaspattribution.investigation.entity.Finding();
        finding.setId(java.util.UUID.randomUUID());
        finding.setInvestigation(investigation);
        finding.setType(type);
        finding.setTitle(title);
        finding.setDescription(desc);
        finding.setSeverity(severity);
        finding.setEvidence(evidence);
        findingRepository.save(finding);
    }

    private in.sih.vaspattribution.investigation.entity.InvestigationNode getOrCreateNode(in.sih.vaspattribution.investigation.entity.Investigation investigation, String chain, String address, int depth) {
        return investigationNodeRepository.findByInvestigationIdAndChainAndAddress(investigation.getId(), chain, address)
                .orElseGet(() -> {
                    in.sih.vaspattribution.investigation.entity.InvestigationNode node = new in.sih.vaspattribution.investigation.entity.InvestigationNode();
                    node.setId(java.util.UUID.randomUUID());
                    node.setInvestigation(investigation);
                    node.setChain(chain);
                    node.setAddress(address);
                    node.setHop(depth);

                    java.util.Optional<in.sih.vaspattribution.entity.entity.EntityAddress> entityAddressOpt = entityAddressRepository.findByChainAndAddress(chain, address);
                    if (entityAddressOpt.isPresent()) {
                        in.sih.vaspattribution.entity.entity.EntityAddress ea = entityAddressOpt.get();
                        node.setEntity(ea.getEntity());
                    }
                    return investigationNodeRepository.save(node);
                });
    }
}

