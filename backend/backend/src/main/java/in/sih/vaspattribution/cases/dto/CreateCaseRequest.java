package in.sih.vaspattribution.cases.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCaseRequest {
    @NotBlank(message = "Case number is required")
    private String caseNumber;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Priority is required")
    private String priority;
}
