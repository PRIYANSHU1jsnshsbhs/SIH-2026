package in.sih.vaspattribution.engine.risk;

import in.sih.vaspattribution.investigation.entity.InvestigationNode;
import in.sih.vaspattribution.investigation.entity.InvestigationEdge;
import java.util.List;

public interface RiskScorer {
    int calculateRiskScore(InvestigationNode node, List<InvestigationEdge> path);
}
