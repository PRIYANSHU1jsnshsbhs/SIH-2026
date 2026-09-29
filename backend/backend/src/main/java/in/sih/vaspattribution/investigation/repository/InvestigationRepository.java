package in.sih.vaspattribution.investigation.repository;

import in.sih.vaspattribution.investigation.entity.Investigation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@Repository
public interface InvestigationRepository extends JpaRepository<Investigation, UUID> {
    Page<Investigation> findByaCaseId(UUID caseId, Pageable pageable);
}
