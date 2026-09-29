package in.sih.vaspattribution.investigation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateInvestigationRequest {
    private UUID caseId;
    private UUID caseWalletId;

    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private Integer maxHops;
    private java.math.BigDecimal minValue;
    private java.time.OffsetDateTime fromDate;
    private java.time.OffsetDateTime toDate;
}
