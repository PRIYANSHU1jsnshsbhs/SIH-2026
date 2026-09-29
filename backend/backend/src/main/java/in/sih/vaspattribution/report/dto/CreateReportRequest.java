package in.sih.vaspattribution.report.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateReportRequest {
    @NotNull(message = "Investigation ID is required")
    private UUID investigationId;
}
