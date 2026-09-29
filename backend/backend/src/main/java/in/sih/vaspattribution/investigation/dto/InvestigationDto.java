package in.sih.vaspattribution.investigation.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestigationDto {
    private UUID id;
    private UUID caseId;
    private String startChain;
    private String startAddress;
    private Integer maxHops;
    private String status;
    private Integer progress;
    private String currentStage;
    private Integer nodesFound;
    private Integer edgesFound;
    private String error;
    private OffsetDateTime createdAt;
}
