package in.sih.vaspattribution.entity.repository;

import in.sih.vaspattribution.entity.entity.EntityAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EntityAddressRepository extends JpaRepository<EntityAddress, UUID> {
    Optional<EntityAddress> findByChainAndAddress(String chain, String address);
    java.util.List<EntityAddress> findByAddressIn(java.util.List<String> addresses);
}

