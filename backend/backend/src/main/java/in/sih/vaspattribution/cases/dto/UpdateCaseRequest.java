package in.sih.vaspattribution.cases.dto;

import lombok.Data;

@Data
public class UpdateCaseRequest {
    private String title;
    private String description;
    private String priority;
    private String status;
}
