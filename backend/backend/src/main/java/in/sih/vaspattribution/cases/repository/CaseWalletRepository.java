package in.sih.vaspattribution.cases.repository;

import in.sih.vaspattribution.cases.entity.CaseWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CaseWalletRepository extends JpaRepository<CaseWallet, UUID> {
    List<CaseWallet> findByaCaseId(UUID caseId);
    boolean existsByaCaseIdAndChainAndAddress(UUID caseId, String chain, String address);
}
