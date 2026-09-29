package in.sih.vaspattribution.finding.repository;

import in.sih.vaspattribution.investigation.entity.Finding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FindingRepository extends JpaRepository<Finding, UUID> {
    List<Finding> findByInvestigationId(UUID investigationId);
    List<Finding> findByInvestigationIdAndType(UUID investigationId, String type);
}
