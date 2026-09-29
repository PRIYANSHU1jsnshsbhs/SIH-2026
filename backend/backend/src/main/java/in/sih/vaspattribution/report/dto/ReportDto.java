package in.sih.vaspattribution.report.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ReportDto {
    private UUID id;
    private UUID investigationId;
    private String title;
    private String content;
    private UUID createdBy;
    private OffsetDateTime createdAt;
}
