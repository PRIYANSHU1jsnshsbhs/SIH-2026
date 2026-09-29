package in.sih.vaspattribution.investigation.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;
import java.time.OffsetDateTime;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FindingDto {
    private UUID id;
    private UUID investigationId;
    private String type;
    private String title;
    private String description;
    private String severity;
    private String evidence;
    private OffsetDateTime createdAt;
}
