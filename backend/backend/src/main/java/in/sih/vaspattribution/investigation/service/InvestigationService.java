package in.sih.vaspattribution.investigation.service;

import in.sih.vaspattribution.auth.entity.User;
import in.sih.vaspattribution.auth.repository.UserRepository;
import in.sih.vaspattribution.cases.entity.Case;
import in.sih.vaspattribution.cases.entity.CaseWallet;
import in.sih.vaspattribution.cases.repository.CaseRepository;
import in.sih.vaspattribution.cases.repository.CaseWalletRepository;
import in.sih.vaspattribution.common.exception.ResourceNotFoundException;
import in.sih.vaspattribution.investigation.dto.CreateInvestigationRequest;
import in.sih.vaspattribution.investigation.dto.InvestigationDto;
import in.sih.vaspattribution.investigation.dto.InvestigationResponse;
import in.sih.vaspattribution.investigation.entity.Investigation;
import in.sih.vaspattribution.investigation.entity.InvestigationEdge;
import in.sih.vaspattribution.investigation.entity.InvestigationNode;
import in.sih.vaspattribution.investigation.repository.InvestigationEdgeRepository;
import in.sih.vaspattribution.investigation.repository.InvestigationNodeRepository;
import in.sih.vaspattribution.engine.AttributionEngine;
import in.sih.vaspattribution.investigation.repository.InvestigationRepository;
import in.sih.vaspattribution.entity.repository.EntityAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import in.sih.vaspattribution.finding.repository.FindingRepository;
import in.sih.vaspattribution.investigation.dto.FindingDto;
import in.sih.vaspattribution.investigation.entity.Finding;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvestigationService {

    private final InvestigationRepository investigationRepository;
    private final InvestigationNodeRepository investigationNodeRepository;
    private final InvestigationEdgeRepository investigationEdgeRepository;
    private final CaseWalletRepository caseWalletRepository;
    private final CaseRepository caseRepository;
    private final UserRepository userRepository;
    private final FindingRepository findingRepository;
    private final AttributionEngine attributionEngine;
    private final EntityAddressRepository entityAddressRepository;

    @Transactional
    public InvestigationDto createInvestigation(UUID caseId, CreateInvestigationRequest request, UUID currentUserId) {
        Case aCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case", "id", caseId));
        
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        CaseWallet caseWallet = caseWalletRepository.findById(request.getCaseWalletId())
                .orElseThrow(() -> new ResourceNotFoundException("CaseWallet", "id", request.getCaseWalletId()));

        Investigation investigation = new Investigation();
        investigation.setId(UUID.randomUUID());
        investigation.setACase(aCase);
        investigation.setStartChain(caseWallet.getChain());
        investigation.setStartAddress(caseWallet.getAddress());
        investigation.setMaxHops(request.getMaxHops() != null ? request.getMaxHops() : 5);
        investigation.setMinValue(request.getMinValue());
        investigation.setFromDate(request.getFromDate());
        investigation.setToDate(request.getToDate());
        investigation.setStatus("IN_PROGRESS");
        investigation.setProgress(0);
        investigation.setCurrentStage("INITIALIZING");

        Investigation saved = investigationRepository.save(investigation);

        InvestigationNode startNode = new InvestigationNode();
        startNode.setId(UUID.randomUUID());
        startNode.setInvestigation(saved);
        startNode.setChain(caseWallet.getChain());
        startNode.setAddress(caseWallet.getAddress());
        startNode.setHop(0);
        investigationNodeRepository.save(startNode);

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                attributionEngine.runInvestigation(saved.getId());
            }
        });

        return mapToDto(saved);
    }

    public Page<InvestigationDto> getInvestigationsByCaseId(UUID caseId, Pageable pageable) {
        return investigationRepository.findByaCaseId(caseId, pageable)
                .map(this::mapToDto);
    }

    public InvestigationResponse getInvestigationGraph(UUID investigationId) {
        Investigation investigation = investigationRepository.findById(investigationId)
                .orElseThrow(() -> new ResourceNotFoundException("Investigation", "id", investigationId));
                
        List<InvestigationNode> nodes = investigationNodeRepository.findByInvestigationId(investigationId);
        List<InvestigationEdge> edges = investigationEdgeRepository.findByInvestigationId(investigationId);

        List<InvestigationResponse.NodeDto> nodeDtos = nodes.stream()
                .map(n -> InvestigationResponse.NodeDto.builder()
                        .id(n.getId().toString())
                        .chain(n.getChain())
                        .address(n.getAddress())
                        .entityName(n.getEntity() != null ? n.getEntity().getName() : null)
                        .entityType(n.getEntity() != null ? n.getEntity().getEntityType() : null)
                        .entityId(n.getEntity() != null ? n.getEntity().getId() : null)
                        .isVasp(n.getEntity() != null && ("EXCHANGE".equalsIgnoreCase(n.getEntity().getEntityType()) || "VASP".equalsIgnoreCase(n.getEntity().getEntityType())))
                        .riskScore(n.getRiskScore() != null ? n.getRiskScore().doubleValue() : null)
                        .build())
                .collect(Collectors.toList());

        List<InvestigationResponse.EdgeDto> edgeDtos = edges.stream()
                .map(e -> InvestigationResponse.EdgeDto.builder()
                        .id(e.getId().toString())
                        .source(e.getSourceAddress())
                        .target(e.getTargetAddress())
                        .txHash(e.getTxHash())
                        .value(e.getAmount())
                        .asset(e.getAsset())
                        .build())
                .collect(Collectors.toList());

        return InvestigationResponse.builder()
                .id(investigation.getId())
                .caseId(investigation.getACase().getId())
                .status(investigation.getStatus())
                .nodes(nodeDtos)
                .edges(edgeDtos)
                .build();
    }

    @Transactional
    public void cancelInvestigation(UUID investigationId) {
        Investigation investigation = investigationRepository.findById(investigationId)
                .orElseThrow(() -> new ResourceNotFoundException("Investigation", "id", investigationId));
        
        if (!"COMPLETED".equals(investigation.getStatus()) && !"FAILED".equals(investigation.getStatus())) {
            investigation.setStatus("CANCELLED");
            investigationRepository.save(investigation);
        }
    }

    public InvestigationDto getInvestigationStatus(UUID investigationId) {
        Investigation investigation = investigationRepository.findById(investigationId)
                .orElseThrow(() -> new ResourceNotFoundException("Investigation", "id", investigationId));
        return mapToDto(investigation);
    }

    public List<FindingDto> getFindingsByInvestigationId(UUID investigationId, String type) {
        List<Finding> findings;
        if (type != null) {
            findings = findingRepository.findByInvestigationIdAndType(investigationId, type);
        } else {
            findings = findingRepository.findByInvestigationId(investigationId);
        }
        
        return findings.stream().map(f -> FindingDto.builder()
                .id(f.getId())
                .investigationId(f.getInvestigation().getId())
                .type(f.getType())
                .title(f.getTitle())
                .description(f.getDescription())
                .severity(f.getSeverity())
                .evidence(f.getEvidence())
                .createdAt(f.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<in.sih.vaspattribution.investigation.dto.AttributionDto> getAttributionByInvestigationId(UUID investigationId) {
        Investigation investigation = investigationRepository.findById(investigationId)
                .orElseThrow(() -> new ResourceNotFoundException("Investigation", "id", investigationId));
                
        List<AttributionEngine.InvestigationPath> candidates = attributionEngine.getAttributionCandidates(investigationId);

        return candidates.stream().map(candidate -> {
            InvestigationNode vaspNode = candidate.node;
            List<InvestigationEdge> pathEdges = candidate.edges;
            
            in.sih.vaspattribution.investigation.dto.AttributionDto dto = new in.sih.vaspattribution.investigation.dto.AttributionDto();
            dto.setChain(investigation.getStartChain());
            dto.setDestinationAddress(vaspNode.getAddress());
            dto.setHopCount(vaspNode.getHop());
            
            if (vaspNode.getEntity() != null) {
                dto.setEntityId(vaspNode.getEntity().getId());
                dto.setEntityName(vaspNode.getEntity().getName());
                dto.setEntityType(vaspNode.getEntity().getEntityType());
            }

            Double confidence = null;
            in.sih.vaspattribution.entity.entity.EntityAddress ea = entityAddressRepository.findByChainAndAddress(vaspNode.getChain(), vaspNode.getAddress()).orElse(null);
            if (ea != null) {
                confidence = ea.getConfidence();
            }
            dto.setConfidence(confidence);
            
            StringBuilder evidence = new StringBuilder();
            if (pathEdges.isEmpty()) {
                evidence.append(vaspNode.getAddress());
            } else {
                evidence.append(pathEdges.get(0).getSourceAddress());
                for (InvestigationEdge edge : pathEdges) {
                    evidence.append(" -> (").append(edge.getTxHash()).append(") -> ").append(edge.getTargetAddress());
                }
            }
            
            dto.setPath(evidence.toString());
            dto.setEvidence(evidence.toString());
            
            java.math.BigDecimal amount = java.math.BigDecimal.ZERO;
            String asset = "UNKNOWN";
            java.util.List<String> transactions = new java.util.ArrayList<>();
            
            if (!pathEdges.isEmpty()) {
                InvestigationEdge lastEdge = pathEdges.get(pathEdges.size() - 1);
                amount = lastEdge.getAmount();
                asset = lastEdge.getAsset();
                transactions = pathEdges.stream().map(InvestigationEdge::getTxHash).collect(Collectors.toList());
            }
            
            dto.setAmount(amount);
            dto.setAsset(asset != null ? asset : "UNKNOWN");
            dto.setTransactions(transactions);
            
            return dto;
        }).collect(Collectors.toList());
    }

    private InvestigationDto mapToDto(Investigation investigation) {
        return InvestigationDto.builder()
                .id(investigation.getId())
                .caseId(investigation.getACase().getId())
                .startChain(investigation.getStartChain())
                .startAddress(investigation.getStartAddress())
                .maxHops(investigation.getMaxHops())
                .status(investigation.getStatus())
                .progress(investigation.getProgress())
                .currentStage(investigation.getCurrentStage())
                .nodesFound(investigation.getNodesFound())
                .edgesFound(investigation.getEdgesFound())
                .error(investigation.getErrorMessage())
                .createdAt(investigation.getCreatedAt())
                .build();
    }
}
