package in.sih.vaspattribution.risk.service;

import in.sih.vaspattribution.engine.risk.RuleBasedRiskScorer;
import in.sih.vaspattribution.entity.entity.EntityAddress;
import in.sih.vaspattribution.entity.repository.EntityAddressRepository;
import in.sih.vaspattribution.investigation.entity.InvestigationNode;
import in.sih.vaspattribution.risk.dto.RiskScoreDto;
import in.sih.vaspattribution.risk.entity.RiskScore;
import in.sih.vaspattribution.risk.repository.RiskScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class RiskService {

    private final RiskScoreRepository riskScoreRepository;
    private final RuleBasedRiskScorer riskScorer;
    private final EntityAddressRepository entityAddressRepository;

    public RiskScoreDto getRiskScore(String chain, String address) {
        RiskScore score = riskScoreRepository.findByWalletChainAndWalletAddress(chain.toLowerCase(), address)
                .orElseGet(() -> {
                    RiskScore calculated = new RiskScore();
                    calculated.setWalletChain(chain);
                    calculated.setWalletAddress(address);
                    
                    InvestigationNode dummyNode = new InvestigationNode();
                    dummyNode.setAddress(address);
                    dummyNode.setChain(chain);
                    dummyNode.setHop(0);

                    EntityAddress entityAddress = entityAddressRepository.findByChainAndAddress(chain.toLowerCase(), address).orElse(null);
                    if (entityAddress != null) {
                        dummyNode.setEntity(entityAddress.getEntity());
                    }

                    int val = riskScorer.calculateRiskScore(dummyNode, Collections.emptyList());
                    calculated.setRiskScore(val);
                    calculated.setRiskLevel(val > 70 ? "HIGH" : (val > 40 ? "MEDIUM" : "LOW"));
                    return calculated;
                });

        return RiskScoreDto.builder()
                .chain(score.getWalletChain())
                .address(score.getWalletAddress())
                .score(score.getRiskScore() != null ? score.getRiskScore().doubleValue() : null)
                .category(score.getRiskLevel())
                .build();
    }
}
