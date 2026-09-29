package in.sih.vaspattribution.cases.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateVaspRequestDto {
    @NotNull(message = "Entity ID is required")
    private UUID entityId;

    private UUID investigationId;

    @NotBlank(message = "Request type is required")
    private String requestType;

    private String notes;
}
