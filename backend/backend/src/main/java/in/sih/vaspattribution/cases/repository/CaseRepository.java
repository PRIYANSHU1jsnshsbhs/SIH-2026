package in.sih.vaspattribution.cases.repository;

import in.sih.vaspattribution.cases.entity.Case;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CaseRepository extends JpaRepository<Case, UUID> {
    Optional<Case> findByCaseNumber(String caseNumber);
}
