package in.sih.vaspattribution.investigation.repository;

import in.sih.vaspattribution.investigation.entity.InvestigationEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvestigationEdgeRepository extends JpaRepository<InvestigationEdge, UUID> {
    List<InvestigationEdge> findByInvestigationId(UUID investigationId);
    Optional<InvestigationEdge> findByInvestigationIdAndTxHash(UUID investigationId, String txHash);
}
