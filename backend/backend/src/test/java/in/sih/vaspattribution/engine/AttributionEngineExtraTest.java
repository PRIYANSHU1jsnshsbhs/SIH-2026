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

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class AttributionEngineExtraTest {

    @Test
    public void testAmountPrecision() {
        // Prove that 0.1 is handled exactly using BigDecimal without floating point drift
        java.math.BigDecimal value = new java.math.BigDecimal("0.1");
        java.math.BigDecimal val3 = value.add(value).add(value); // 0.3 exact
        
        Investigation inv = new Investigation();
        inv.setId(UUID.randomUUID());
        inv.setStatus("IN_PROGRESS");
        when(investigationRepository.findById(inv.getId())).thenReturn(Optional.of(inv));
        
        InvestigationNode startNode = new InvestigationNode();
        startNode.setId(UUID.randomUUID());
        startNode.setInvestigation(inv);
        startNode.setChain("Ethereum");
        startNode.setAddress("START");
        startNode.setHop(0);
        when(investigationNodeRepository.findByInvestigationId(inv.getId())).thenReturn(List.of(startNode));
        
        BlockchainTransaction tx1 = BlockchainTransaction.builder()
                .txHash("tx-precision-1")
                .fromAddress("START")
                .toAddress("A")
                .value(val3) // 0.3 exactly
                .chain("Ethereum")
                .build();
                
        when(providerRegistry.getProvider("Ethereum")).thenReturn(provider);
        when(provider.getTransactions(eq("START"), any())).thenReturn(List.of(tx1));
        when(provider.getTransactions(eq("A"), any())).thenReturn(java.util.Collections.emptyList());
        
        EntityAddress ea = new EntityAddress();
        VaspEntity entity = new VaspEntity();
        entity.setEntityType("VASP");
        ea.setEntity(entity);
        when(entityAddressRepository.findByChainAndAddress("Ethereum", "A")).thenReturn(Optional.of(ea));
        
        when(investigationNodeRepository.findByInvestigationIdAndChainAndAddress(any(), any(), any())).thenReturn(Optional.empty());
        when(investigationNodeRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(investigationEdgeRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        
        attributionEngine.runInvestigation(inv.getId());
        
        ArgumentCaptor<InvestigationEdge> edgeCaptor = ArgumentCaptor.forClass(InvestigationEdge.class);
        verify(investigationEdgeRepository, atLeastOnce()).save(edgeCaptor.capture());
        
        java.math.BigDecimal savedAmount = edgeCaptor.getAllValues().get(0).getAmount();
        assertEquals(new java.math.BigDecimal("0.3"), savedAmount); // Cannot be 0.30000000000000004
    }

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

    private BlockchainTransaction createTx(String from, String to, java.math.BigDecimal value) {
        return BlockchainTransaction.builder()
                .chain("ethereum")
                .txHash(UUID.randomUUID().toString())
                .fromAddress(from)
                .toAddress(to)
                .value(value)
                .asset("ETH")
                .timestamp(OffsetDateTime.now())
                .build();
    }

    private Investigation createInv() {
        Investigation inv = new Investigation();
        inv.setId(UUID.randomUUID());
        inv.setMaxHops(5);
        inv.setStatus("IN_PROGRESS");
        return inv;
    }

    private InvestigationNode createStartNode(Investigation inv) {
        InvestigationNode startNode = new InvestigationNode();
        startNode.setId(UUID.randomUUID());
        startNode.setInvestigation(inv);
        startNode.setChain("ethereum");
        startNode.setAddress("START");
        startNode.setHop(0);
        return startNode;
    }

    private void mockNodeCreation(String address, VaspEntity entity) {
        when(investigationNodeRepository.findByInvestigationIdAndChainAndAddress(any(), any(), eq(address)))
                .thenReturn(Optional.empty()); // simulate new node
                
        if (entity != null) {
            EntityAddress ea = new EntityAddress();
            ea.setEntity(entity);
            when(entityAddressRepository.findByChainAndAddress(any(), eq(address))).thenReturn(Optional.of(ea));
        }
    }

    @Test
    public void testDirectVasp() {
        Investigation inv = createInv();
        InvestigationNode startNode = createStartNode(inv);

        when(investigationRepository.findById(inv.getId())).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(inv.getId())).thenReturn(List.of(startNode));

        BlockchainTransaction tx = createTx("START", "Exchange1", new java.math.BigDecimal("10.0"));
        when(provider.getTransactions(eq("START"), any())).thenReturn(List.of(tx));

        VaspEntity ex1 = new VaspEntity();
        ex1.setEntityType("EXCHANGE");
        mockNodeCreation("Exchange1", ex1);

        attributionEngine.runInvestigation(inv.getId());

        ArgumentCaptor<Finding> findingCaptor = ArgumentCaptor.forClass(Finding.class);
        verify(findingRepository, atLeastOnce()).save(findingCaptor.capture());
        
        boolean foundVasp = findingCaptor.getAllValues().stream().anyMatch(f -> "VASP_EXPOSURE".equals(f.getType()));
        assertEquals(true, foundVasp);
    }

    @Test
    public void testSelfLoop() {
        Investigation inv = createInv();
        InvestigationNode startNode = createStartNode(inv);

        when(investigationRepository.findById(inv.getId())).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(inv.getId())).thenReturn(List.of(startNode));

        when(provider.getTransactions(eq("START"), any())).thenReturn(List.of(createTx("START", "START", new java.math.BigDecimal("10.0"))));

        attributionEngine.runInvestigation(inv.getId());
        verify(investigationRepository, atLeastOnce()).save(any());
    }

    @Test
    public void testDuplicateTransactions() {
        Investigation inv = createInv();
        InvestigationNode startNode = createStartNode(inv);

        when(investigationRepository.findById(inv.getId())).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(inv.getId())).thenReturn(List.of(startNode));

        when(provider.getTransactions(eq("START"), any())).thenReturn(List.of(
            createTx("START", "A", new java.math.BigDecimal("10.0")),
            createTx("START", "A", new java.math.BigDecimal("20.0"))
        ));
        
        mockNodeCreation("A", null);

        attributionEngine.runInvestigation(inv.getId());
        verify(investigationEdgeRepository, atLeastOnce()).save(any());
    }

    @Test
    public void testLargeFanOut() {
        Investigation inv = createInv();
        InvestigationNode startNode = createStartNode(inv);

        when(investigationRepository.findById(inv.getId())).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(inv.getId())).thenReturn(List.of(startNode));

        List<BlockchainTransaction> txs = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            txs.add(createTx("START", "A" + i, new java.math.BigDecimal("1.0")));
            mockNodeCreation("A" + i, null);
        }
        when(provider.getTransactions(eq("START"), any())).thenReturn(txs);

        attributionEngine.runInvestigation(inv.getId());

        ArgumentCaptor<Finding> findingCaptor = ArgumentCaptor.forClass(Finding.class);
        verify(findingRepository, atLeastOnce()).save(findingCaptor.capture());
        
        boolean foundFanOut = findingCaptor.getAllValues().stream().anyMatch(f -> "FAN_OUT".equals(f.getType()));
        assertEquals(true, foundFanOut);
    }

    @Test
    public void testCancellationDuringRun() {
        Investigation inv = createInv();
        InvestigationNode startNode = createStartNode(inv);

        when(investigationRepository.findById(inv.getId())).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(inv.getId())).thenReturn(List.of(startNode));

        when(provider.getTransactions(eq("START"), any())).thenReturn(List.of(createTx("START", "A", new java.math.BigDecimal("10.0"))));
        mockNodeCreation("A", null);

        // Cancel it right before final save
        Investigation cancelledInv = new Investigation();
        cancelledInv.setId(inv.getId());
        cancelledInv.setStatus("CANCELLED");
        when(investigationRepository.findById(inv.getId())).thenReturn(Optional.of(inv), Optional.of(cancelledInv));

        attributionEngine.runInvestigation(inv.getId());

        // Ensure we don't save COMPLETED
        ArgumentCaptor<Investigation> invCaptor = ArgumentCaptor.forClass(Investigation.class);
        verify(investigationRepository, atLeastOnce()).save(invCaptor.capture());
        
        boolean overwritten = invCaptor.getAllValues().stream().anyMatch(i -> "COMPLETED".equals(i.getStatus()));
        assertEquals(false, overwritten);
    }

    @Test
    public void testLargeTransfer() {
        Investigation inv = createInv();
        InvestigationNode startNode = createStartNode(inv);
        when(investigationRepository.findById(inv.getId())).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(inv.getId())).thenReturn(List.of(startNode));

        BlockchainTransaction tx = createTx("START", "A", new java.math.BigDecimal("200000.0"));
        when(provider.getTransactions(eq("START"), any())).thenReturn(List.of(tx));
        mockNodeCreation("A", null);

        attributionEngine.runInvestigation(inv.getId());

        ArgumentCaptor<Finding> findingCaptor = ArgumentCaptor.forClass(Finding.class);
        verify(findingRepository, atLeastOnce()).save(findingCaptor.capture());
        
        Optional<Finding> findingOpt = findingCaptor.getAllValues().stream().filter(f -> "LARGE_TRANSFER".equals(f.getType())).findFirst();
        assertEquals(true, findingOpt.isPresent());
        assertEquals("LARGE_TRANSFER", findingOpt.get().getType());
        assertEquals(true, findingOpt.get().getEvidence() != null && findingOpt.get().getEvidence().contains(tx.getTxHash()));
        assertEquals(inv.getId(), findingOpt.get().getInvestigation().getId());
    }

    @Test
    public void testFanIn() {
        Investigation inv = createInv();
        InvestigationNode startNode = createStartNode(inv);
        when(investigationRepository.findById(inv.getId())).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(inv.getId())).thenReturn(List.of(startNode));

        List<BlockchainTransaction> txs = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            txs.add(createTx("START", "TARGET", new java.math.BigDecimal("1.0")));
        }
        when(provider.getTransactions(eq("START"), any())).thenReturn(txs);
        mockNodeCreation("TARGET", null);

        attributionEngine.runInvestigation(inv.getId());

        ArgumentCaptor<Finding> findingCaptor = ArgumentCaptor.forClass(Finding.class);
        verify(findingRepository, atLeastOnce()).save(findingCaptor.capture());
        
        Optional<Finding> findingOpt = findingCaptor.getAllValues().stream().filter(f -> "FAN_IN".equals(f.getType())).findFirst();
        assertEquals(true, findingOpt.isPresent());
        assertEquals(true, findingOpt.get().getEvidence() != null && findingOpt.get().getEvidence().contains("TARGET"));
        assertEquals(inv.getId(), findingOpt.get().getInvestigation().getId());
    }

    @Test
    public void testMixerExposure() {
        Investigation inv = createInv();
        InvestigationNode startNode = createStartNode(inv);
        when(investigationRepository.findById(inv.getId())).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(inv.getId())).thenReturn(List.of(startNode));

        BlockchainTransaction tx = createTx("START", "MIX", new java.math.BigDecimal("10.0"));
        when(provider.getTransactions(eq("START"), any())).thenReturn(List.of(tx));

        VaspEntity mixer = new VaspEntity();
        mixer.setEntityType("MIXER");
        mockNodeCreation("MIX", mixer);

        attributionEngine.runInvestigation(inv.getId());

        ArgumentCaptor<Finding> findingCaptor = ArgumentCaptor.forClass(Finding.class);
        verify(findingRepository, atLeastOnce()).save(findingCaptor.capture());
        
        Optional<Finding> findingOpt = findingCaptor.getAllValues().stream().filter(f -> "MIXER_EXPOSURE".equals(f.getType())).findFirst();
        assertEquals(true, findingOpt.isPresent());
        assertEquals(true, findingOpt.get().getEvidence() != null && findingOpt.get().getEvidence().contains("MIX"));
        assertEquals(inv.getId(), findingOpt.get().getInvestigation().getId());
    }

    @Test
    public void testBridgeUsage() {
        Investigation inv = createInv();
        InvestigationNode startNode = createStartNode(inv);
        when(investigationRepository.findById(inv.getId())).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(inv.getId())).thenReturn(List.of(startNode));

        BlockchainTransaction tx = createTx("START", "BRG", new java.math.BigDecimal("10.0"));
        when(provider.getTransactions(eq("START"), any())).thenReturn(List.of(tx));

        VaspEntity bridge = new VaspEntity();
        bridge.setEntityType("BRIDGE");
        mockNodeCreation("BRG", bridge);

        attributionEngine.runInvestigation(inv.getId());

        ArgumentCaptor<Finding> findingCaptor = ArgumentCaptor.forClass(Finding.class);
        verify(findingRepository, atLeastOnce()).save(findingCaptor.capture());
        
        Optional<Finding> findingOpt = findingCaptor.getAllValues().stream().filter(f -> "BRIDGE_USAGE".equals(f.getType())).findFirst();
        assertEquals(true, findingOpt.isPresent());
        assertEquals(true, findingOpt.get().getEvidence() != null && findingOpt.get().getEvidence().contains("BRG"));
        assertEquals(inv.getId(), findingOpt.get().getInvestigation().getId());
    }

    @Test
    public void testHighRiskCounterparty() {
        Investigation inv = createInv();
        InvestigationNode startNode = createStartNode(inv);
        when(investigationRepository.findById(inv.getId())).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(inv.getId())).thenReturn(List.of(startNode));

        BlockchainTransaction tx = createTx("START", "RISK", new java.math.BigDecimal("10.0"));
        when(provider.getTransactions(eq("START"), any())).thenReturn(List.of(tx));
        mockNodeCreation("RISK", null);

        when(riskScorer.calculateRiskScore(any(), any())).thenReturn(85);

        attributionEngine.runInvestigation(inv.getId());

        ArgumentCaptor<Finding> findingCaptor = ArgumentCaptor.forClass(Finding.class);
        verify(findingRepository, atLeastOnce()).save(findingCaptor.capture());
        
        Optional<Finding> findingOpt = findingCaptor.getAllValues().stream().filter(f -> "HIGH_RISK_COUNTERPARTY".equals(f.getType())).findFirst();
        assertEquals(true, findingOpt.isPresent());
        assertEquals(true, findingOpt.get().getEvidence() != null && findingOpt.get().getEvidence().contains("RISK"));
        assertEquals(inv.getId(), findingOpt.get().getInvestigation().getId());
    }
}
