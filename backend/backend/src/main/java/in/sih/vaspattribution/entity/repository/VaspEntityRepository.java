package in.sih.vaspattribution.entity.repository;

import in.sih.vaspattribution.entity.entity.VaspEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VaspEntityRepository extends JpaRepository<VaspEntity, UUID> {
}
