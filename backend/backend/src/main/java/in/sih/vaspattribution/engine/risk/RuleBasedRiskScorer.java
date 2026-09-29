package in.sih.vaspattribution.engine.risk;

import in.sih.vaspattribution.investigation.entity.InvestigationNode;
import in.sih.vaspattribution.investigation.entity.InvestigationEdge;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RuleBasedRiskScorer implements RiskScorer {

    @Override
    public int calculateRiskScore(InvestigationNode node, List<InvestigationEdge> path) {
        int score = 0;
        
        if (node.getEntity() != null) {
            String type = node.getEntity().getEntityType();
            if ("EXCHANGE".equalsIgnoreCase(type) || "VASP".equalsIgnoreCase(type)) {
                score += 80; // High confidence for known entity
            } else if ("MIXER".equalsIgnoreCase(type)) {
                score += 100; // High risk for mixer
            }
        }
        
        // Decay based on hop count
        score -= (node.getHop() * 5);

        // Check path amounts
        if (path != null && !path.isEmpty()) {
            java.math.BigDecimal totalAmount = path.stream().map(e -> e.getAmount() != null ? e.getAmount() : java.math.BigDecimal.ZERO).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            if (totalAmount.compareTo(new java.math.BigDecimal("10000")) > 0) {
                score += 10;
            }
        }
        
        return Math.max(0, Math.min(100, score)); // Clamp between 0 and 100
    }
}
