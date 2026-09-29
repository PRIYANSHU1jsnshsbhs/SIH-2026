package in.sih.vaspattribution.cases.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class CaseDto {
    private UUID id;
    private String caseNumber;
    private String title;
    private String description;
    private String priority;
    private String status;
    private UUID createdBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
