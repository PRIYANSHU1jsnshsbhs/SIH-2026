package in.sih.vaspattribution.cases.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class VaspRequestDto {
    private UUID id;
    private UUID caseId;
    private UUID investigationId;
    private UUID entityId;
    private String entityName;
    private String requestType;
    private String status;
    private String notes;
    private UUID createdBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
