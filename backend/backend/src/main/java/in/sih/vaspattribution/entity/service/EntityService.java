package in.sih.vaspattribution.entity.service;

import in.sih.vaspattribution.entity.dto.EntityResponse;
import in.sih.vaspattribution.entity.entity.EntityAddress;
import in.sih.vaspattribution.entity.repository.EntityAddressRepository;
import in.sih.vaspattribution.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EntityService {

    private final EntityAddressRepository entityAddressRepository;

    public EntityResponse findByAddress(String chain, String address) {
        EntityAddress entityAddress = entityAddressRepository.findByChainAndAddress(chain.toLowerCase(), address)
                .orElseThrow(() -> new ResourceNotFoundException("Entity", "address", address));

        return EntityResponse.builder()
                .chain(entityAddress.getChain())
                .address(entityAddress.getAddress())
                .entity(EntityResponse.EntityDto.builder()
                        .entityId(entityAddress.getEntity().getId())
                        .name(entityAddress.getEntity().getName())
                        .type(entityAddress.getEntity().getEntityType())
                        .build())
                .confidence(entityAddress.getConfidence())
                .evidence(List.of(EntityResponse.EvidenceDto.builder()
                        .source(entityAddress.getSource())
                        .lastVerified(entityAddress.getLastVerified())
                        .build()))
                .build();
    }
}
