package in.sih.vaspattribution.engine;

import in.sih.vaspattribution.entity.entity.VaspEntity;
import in.sih.vaspattribution.entity.repository.EntityAddressRepository;
import in.sih.vaspattribution.investigation.entity.Investigation;
import in.sih.vaspattribution.investigation.entity.InvestigationEdge;
import in.sih.vaspattribution.investigation.entity.InvestigationNode;
import in.sih.vaspattribution.investigation.repository.InvestigationEdgeRepository;
import in.sih.vaspattribution.investigation.repository.InvestigationNodeRepository;
import in.sih.vaspattribution.investigation.repository.InvestigationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AttributionEngineOrderingTest {

    @Mock
    private InvestigationRepository investigationRepository;

    @Mock
    private InvestigationNodeRepository investigationNodeRepository;

    @Mock
    private InvestigationEdgeRepository investigationEdgeRepository;

    @Mock
    private EntityAddressRepository entityAddressRepository;

    @InjectMocks
    private AttributionEngine attributionEngine;

    @Test
    void testCandidateOrderingAndDeterministicPath() {
        UUID invId = UUID.randomUUID();
        Investigation inv = new Investigation();
        inv.setId(invId);
        inv.setStartAddress("node-start");
        inv.setStartChain("mock");

        // Nodes
        InvestigationNode startNode = new InvestigationNode();
        startNode.setAddress("node-start");
        startNode.setChain("mock");
        startNode.setHop(0);

        InvestigationNode intermediate = new InvestigationNode();
        intermediate.setAddress("node-intermediate");
        intermediate.setChain("mock");
        intermediate.setHop(1);

        // VASP 1 (Lower confidence, high amount)
        InvestigationNode vasp1 = new InvestigationNode();
        vasp1.setAddress("vasp-1");
        vasp1.setChain("mock");
        vasp1.setHop(2);
        VaspEntity e1 = new VaspEntity();
        e1.setEntityType("VASP");
        e1.setName("VASP One");
        vasp1.setEntity(e1);

        // VASP 2 (High confidence, low amount)
        InvestigationNode vasp2 = new InvestigationNode();
        vasp2.setAddress("vasp-2");
        vasp2.setChain("mock");
        vasp2.setHop(2);
        VaspEntity e2 = new VaspEntity();
        e2.setEntityType("EXCHANGE");
        e2.setName("VASP Two");
        vasp2.setEntity(e2);

        // Edges
        // start -> intermediate
        InvestigationEdge edge1 = new InvestigationEdge();
        edge1.setSourceAddress("node-start");
        edge1.setTargetAddress("node-intermediate");
        edge1.setTxHash("tx-1");
        edge1.setTimestamp(OffsetDateTime.now(ZoneOffset.UTC));
        edge1.setAmount(BigDecimal.valueOf(100));

        // intermediate -> vasp-1
        InvestigationEdge edge2 = new InvestigationEdge();
        edge2.setSourceAddress("node-intermediate");
        edge2.setTargetAddress("vasp-1");
        edge2.setTxHash("tx-2");
        edge2.setTimestamp(OffsetDateTime.now(ZoneOffset.UTC).plusSeconds(1));
        edge2.setAmount(BigDecimal.valueOf(5000));

        // intermediate -> vasp-2
        InvestigationEdge edge3 = new InvestigationEdge();
        edge3.setSourceAddress("node-intermediate");
        edge3.setTargetAddress("vasp-2");
        edge3.setTxHash("tx-3");
        edge3.setTimestamp(OffsetDateTime.now(ZoneOffset.UTC).plusSeconds(2));
        edge3.setAmount(BigDecimal.valueOf(100));

        // Let's create a cycle / multiple paths to vasp-1 to test deterministic path.
        // start -> vasp-1 directly but later in time or something
        InvestigationEdge edge4 = new InvestigationEdge();
        edge4.setSourceAddress("node-start");
        edge4.setTargetAddress("vasp-1");
        edge4.setTxHash("tx-4");
        // tx-4 timestamp is later than tx-1, so BFS visits tx-1 first.
        edge4.setTimestamp(OffsetDateTime.now(ZoneOffset.UTC).plusSeconds(10));
        edge4.setAmount(BigDecimal.valueOf(10));

        when(investigationRepository.findById(invId)).thenReturn(Optional.of(inv));
        when(investigationNodeRepository.findByInvestigationId(invId))
                .thenReturn(Arrays.asList(startNode, intermediate, vasp1, vasp2));
        when(investigationEdgeRepository.findByInvestigationId(invId))
                .thenReturn(Arrays.asList(edge4, edge3, edge2, edge1)); // Random order

        List<AttributionEngine.InvestigationPath> candidates = attributionEngine.getAttributionCandidates(invId);

        // We expect VASP-2 to win because it has higher confidence (hop count is equal, evidence quality equal/null)
        assertEquals(2, candidates.size());
        assertEquals("vasp-2", candidates.get(0).node.getAddress());
        assertEquals("vasp-1", candidates.get(1).node.getAddress());

        // For vasp-1, check deterministic path.
        // From start node, BFS explores outgoing edges sorted by timestamp.
        // edge1 (tx-1, now) vs edge4 (tx-4, now+10s).
        // BFS explores edge1 first. Then from intermediate, explores edge2 (to vasp-1).
        // Since vasp-1 is reached at hop 2 via edge2, the path should be start -> intermediate -> vasp-1,
        // and NOT the direct edge4, because edge4 is visited later. Wait, edge4 is direct from start, so it's hop 1.
        // If it's hop 1, BFS visits it when processing startNode!
        // startNode has outgoing: edge1 (now), edge4 (now+10).
        // sorted: edge1, then edge4.
        // edge1 targets intermediate. visited adds intermediate.
        // edge4 targets vasp-1. visited adds vasp-1.
        // So vasp-1 is reached at hop 1 via edge4!
        // This means for vasp-1, the path is exactly 1 edge: edge4.
        
        AttributionEngine.InvestigationPath pathVasp1 = candidates.get(1);
        assertEquals(1, pathVasp1.edges.size());
        assertEquals("tx-4", pathVasp1.edges.get(0).getTxHash());
        
        AttributionEngine.InvestigationPath pathVasp2 = candidates.get(0);
        assertEquals(2, pathVasp2.edges.size());
        assertEquals("tx-1", pathVasp2.edges.get(0).getTxHash());
        assertEquals("tx-3", pathVasp2.edges.get(1).getTxHash());
    }
}
