package in.sih.vaspattribution.engine;

import in.sih.vaspattribution.blockchain.dto.BlockchainTransaction;
import in.sih.vaspattribution.blockchain.dto.TransactionQuery;
import in.sih.vaspattribution.blockchain.provider.BlockchainProvider;
import in.sih.vaspattribution.blockchain.provider.BlockchainProviderRegistry;
import in.sih.vaspattribution.engine.risk.RiskScorer;
import in.sih.vaspattribution.entity.entity.EntityAddress;
import in.sih.vaspattribution.entity.entity.VaspEntity;
import in.sih.vaspattribution.entity.repository.EntityAddressRepository;
import in.sih.vaspattribution.finding.repository.FindingRepository;
import in.sih.vaspattribution.investigation.entity.Finding;
import in.sih.vaspattribution.investigation.entity.Investigation;
import in.sih.vaspattribution.investigation.entity.InvestigationNode;
import in.sih.vaspattribution.investigation.entity.InvestigationEdge;
import in.sih.vaspattribution.investigation.repository.InvestigationEdgeRepository;
import in.sih.vaspattribution.investigation.repository.InvestigationNodeRepository;
import in.sih.vaspattribution.investigation.repository.InvestigationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class AttributionEngineTest {

    @Mock
    private InvestigationRepository investigationRepository;
    @Mock
    private InvestigationNodeRepository investigationNodeRepository;
    @Mock
    private InvestigationEdgeRepository investigationEdgeRepository;
    @Mock
    private EntityAddressRepository entityAddressRepository;
    @Mock
    private FindingRepository findingRepository;
    @Mock
    private BlockchainProviderRegistry providerRegistry;
    @Mock
    private BlockchainProvider provider;
    @Mock
    private RiskScorer riskScorer;

    @InjectMocks
    private AttributionEngine attributionEngine;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(attributionEngine, "defaultMaxHops", 5);
        ReflectionTestUtils.setField(attributionEngine, "maxNodes", 5000);
        ReflectionTestUtils.setField(attributionEngine, "maxEdges", 10000);
        ReflectionTestUtils.setField(attributionEngine, "timeoutMs", 300000L);

        when(providerRegistry.getProvider(anyString())).thenReturn(provider);
        when(investigationNodeRepository.save(any(InvestigationNode.class))).thenAnswer(i -> i.getArgument(0));
        when(investigationEdgeRepository.save(any(InvestigationEdge.class))).thenAnswer(i -> i.getArgument(0));
        when(findingRepository.save(any(Finding.class))).thenAnswer(i -> i.getArgument(0));
        when(investigationRepository.save(any(Investigation.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    public void testBfsShortestVasp() {
        // Setup
        UUID invId = UUID.randomUUID();
        Investigation inv = new Investigation();
        inv.setId(invId);
        inv.setMaxHops(5);
        inv.setStatus("IN_PROGRESS");

        InvestigationNode startNode = new InvestigationNode();
        startNode.setId(UUID.randomUUID());
        startNode.setInvestigation(inv);
        startNode.setChain("ethereum");
        startNode.setAddress("START");
        startNode.setHop(0);

        when(investigationRepository.findById(invId)).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(invId)).thenReturn(List.of(startNode));

        // Mock Transactions
        // START -> A
        BlockchainTransaction txStartA = createTx("START", "A");
        // START -> C
        BlockchainTransaction txStartC = createTx("START", "C");
        when(provider.getTransactions(eq("START"), any())).thenReturn(Arrays.asList(txStartA, txStartC));

        // A -> B
        BlockchainTransaction txAB = createTx("A", "B");
        when(provider.getTransactions(eq("A"), any())).thenReturn(List.of(txAB));

        // B -> Exchange1
        BlockchainTransaction txBEx1 = createTx("B", "Exchange1");
        when(provider.getTransactions(eq("B"), any())).thenReturn(List.of(txBEx1));

        // C -> Exchange2
        BlockchainTransaction txCEx2 = createTx("C", "Exchange2");
        when(provider.getTransactions(eq("C"), any())).thenReturn(List.of(txCEx2));

        // Exchange1 and Exchange2 queries return empty (we stop BFS after them theoretically)
        when(provider.getTransactions(eq("Exchange1"), any())).thenReturn(List.of());
        when(provider.getTransactions(eq("Exchange2"), any())).thenReturn(List.of());

        // Mock Nodes and Entities
        mockNodeCreation("A", null);
        mockNodeCreation("B", null);
        mockNodeCreation("C", null);
        
        VaspEntity ex1Entity = new VaspEntity();
        ex1Entity.setName("Exchange1");
        ex1Entity.setEntityType("EXCHANGE");
        mockNodeCreation("Exchange1", ex1Entity);
        
        VaspEntity ex2Entity = new VaspEntity();
        ex2Entity.setName("Exchange2");
        ex2Entity.setEntityType("EXCHANGE");
        mockNodeCreation("Exchange2", ex2Entity);

        // Exchange1 is at hop 3, but let's give it HIGH risk
        // Exchange2 is at hop 2, give it LOW risk
        when(riskScorer.calculateRiskScore(argThat(n -> n != null && "Exchange1".equals(n.getAddress())), any())).thenReturn(95);
        when(riskScorer.calculateRiskScore(argThat(n -> n != null && "Exchange2".equals(n.getAddress())), any())).thenReturn(10);
        when(riskScorer.calculateRiskScore(argThat(n -> n != null && !"Exchange1".equals(n.getAddress()) && !"Exchange2".equals(n.getAddress())), any())).thenReturn(50);

        // Run
        attributionEngine.runInvestigation(invId);

        // Assert
        ArgumentCaptor<Finding> findingCaptor = ArgumentCaptor.forClass(Finding.class);
        verify(findingRepository, atLeastOnce()).save(findingCaptor.capture());

        List<Finding> findings = findingCaptor.getAllValues();
        List<Finding> vaspFindings = findings.stream()
                .filter(f -> "VASP_EXPOSURE".equals(f.getType()))
                .toList();
        assertEquals(2, vaspFindings.size(), "Should have found 2 VASPs");
        
        Finding firstFinding = vaspFindings.get(0);
        assertEquals("VASP_EXPOSURE", firstFinding.getType());
        assertEquals("Found VASP Exchange2 at distance 2", firstFinding.getDescription());
    }

    @Test
    public void testMaxHopStopping() {
        UUID invId = UUID.randomUUID();
        Investigation inv = new Investigation();
        inv.setId(invId);
        inv.setMaxHops(1); // Max hops is 1!
        inv.setStatus("IN_PROGRESS");

        InvestigationNode startNode = new InvestigationNode();
        startNode.setId(UUID.randomUUID());
        startNode.setInvestigation(inv);
        startNode.setChain("ethereum");
        startNode.setAddress("START");
        startNode.setHop(0);

        when(investigationRepository.findById(invId)).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(invId)).thenReturn(List.of(startNode));

        // START -> A (hop 1)
        when(provider.getTransactions(eq("START"), any())).thenReturn(List.of(createTx("START", "A")));
        // A -> Exchange1 (hop 2 - should NOT be reached)
        when(provider.getTransactions(eq("A"), any())).thenReturn(List.of(createTx("A", "Exchange1")));

        mockNodeCreation("A", null);
        VaspEntity ex1 = new VaspEntity();
        ex1.setEntityType("EXCHANGE");
        mockNodeCreation("Exchange1", ex1);

        attributionEngine.runInvestigation(invId);

        verify(findingRepository, never()).save(any());
        verify(investigationRepository, atLeastOnce()).save(argThat(i -> "FAILED".equals(i.getStatus()) || "COMPLETED".equals(i.getStatus()) || "RUNNING".equals(i.getStatus())));
    }

    @Test
    public void testVisitedNodeLoopHandling() {
        UUID invId = UUID.randomUUID();
        Investigation inv = new Investigation();
        inv.setId(invId);
        inv.setMaxHops(5);
        inv.setStatus("IN_PROGRESS");

        InvestigationNode startNode = new InvestigationNode();
        startNode.setId(UUID.randomUUID());
        startNode.setInvestigation(inv);
        startNode.setChain("ethereum");
        startNode.setAddress("START");
        startNode.setHop(0);

        when(investigationRepository.findById(invId)).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(invId)).thenReturn(List.of(startNode));

        // Loop: START -> A -> B -> A
        when(provider.getTransactions(eq("START"), any())).thenReturn(List.of(createTx("START", "A")));
        when(provider.getTransactions(eq("A"), any())).thenReturn(List.of(createTx("A", "B")));
        when(provider.getTransactions(eq("B"), any())).thenReturn(List.of(createTx("B", "A"))); // Loop back to A

        mockNodeCreation("A", null);
        mockNodeCreation("B", null);

        attributionEngine.runInvestigation(invId);

        // It shouldn't crash, and should finish
        verify(investigationRepository, atLeast(2)).save(any());
    }

    @Test
    public void testInvestigationCancellation() {
        UUID invId = UUID.randomUUID();
        Investigation inv = new Investigation();
        inv.setId(invId);
        inv.setMaxHops(5);
        inv.setStatus("CANCELLED"); // cancelled before or during!

        InvestigationNode startNode = new InvestigationNode();
        startNode.setId(UUID.randomUUID());
        startNode.setInvestigation(inv);
        startNode.setChain("ethereum");
        startNode.setAddress("START");
        startNode.setHop(0);

        Investigation cancelledInv = new Investigation();
        cancelledInv.setId(invId);
        cancelledInv.setStatus("CANCELLED");
        
        when(investigationRepository.findById(invId)).thenReturn(Optional.of(inv), Optional.of(cancelledInv));
        when(investigationNodeRepository.findByInvestigationId(invId)).thenReturn(List.of(startNode));

        attributionEngine.runInvestigation(invId);

        verify(provider, never()).getTransactions(anyString(), any());
    }

    private void mockNodeCreation(String address, VaspEntity entity) {
        when(investigationNodeRepository.findByInvestigationIdAndChainAndAddress(any(), any(), eq(address)))
                .thenReturn(Optional.empty()); // simulate new node
                
        if (entity != null) {
            EntityAddress ea = new EntityAddress();
            ea.setEntity(entity);
            when(entityAddressRepository.findByChainAndAddress(any(), eq(address)))
                    .thenReturn(Optional.of(ea));
        } else {
            when(entityAddressRepository.findByChainAndAddress(any(), eq(address)))
                    .thenReturn(Optional.empty());
        }

        when(investigationNodeRepository.save(any())).thenAnswer(i -> {
            InvestigationNode node = i.getArgument(0);
            if (node != null && node.getId() == null) node.setId(UUID.randomUUID());
            return node;
        });

        when(investigationNodeRepository.saveAll(any())).thenAnswer(i -> {
            Iterable<InvestigationNode> nodes = i.getArgument(0);
            if (nodes != null) {
                nodes.forEach(node -> {
                    if (node.getId() == null) node.setId(UUID.randomUUID());
                });
            }
            return nodes;
        });
    }

    private BlockchainTransaction createTx(String from, String to) {
        return BlockchainTransaction.builder()
                .chain("ethereum")
                .txHash(UUID.randomUUID().toString())
                .fromAddress(from)
                .toAddress(to)
                .value(new java.math.BigDecimal("100.0"))
                .build();
    }
}
