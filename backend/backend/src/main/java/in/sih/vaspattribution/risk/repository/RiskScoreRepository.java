package in.sih.vaspattribution.risk.repository;

import in.sih.vaspattribution.risk.entity.RiskScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RiskScoreRepository extends JpaRepository<RiskScore, UUID> {
    Optional<RiskScore> findByWalletChainAndWalletAddress(String walletChain, String walletAddress);
}
