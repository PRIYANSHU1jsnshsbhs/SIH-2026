package in.sih.vaspattribution.finding.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class FindingDto {
    private UUID id;
    private UUID investigationId;
    private String type;
    private String description;
    private String title;
    private String severity;
    private String evidence;
    private OffsetDateTime createdAt;
}
