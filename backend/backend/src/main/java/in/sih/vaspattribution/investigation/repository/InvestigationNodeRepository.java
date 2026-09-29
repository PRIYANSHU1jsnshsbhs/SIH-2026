package in.sih.vaspattribution.investigation.repository;

import in.sih.vaspattribution.investigation.entity.InvestigationNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvestigationNodeRepository extends JpaRepository<InvestigationNode, UUID> {
    List<InvestigationNode> findByInvestigationId(UUID investigationId);
    Optional<InvestigationNode> findByInvestigationIdAndChainAndAddress(UUID investigationId, String chain, String address);
}
