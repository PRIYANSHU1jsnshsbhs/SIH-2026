package in.sih.vaspattribution.entity.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class EntityResponse {
    private String chain;
    private String address;
    private EntityDto entity;
    private Double confidence;
    private List<EvidenceDto> evidence;

    @Data
    @Builder
    public static class EntityDto {
        @JsonProperty("entity_id")
        private UUID entityId;
        private String name;
        private String type;
    }

    @Data
    @Builder
    public static class EvidenceDto {
        private String source;
        @JsonProperty("last_verified")
        private OffsetDateTime lastVerified;
    }
}
