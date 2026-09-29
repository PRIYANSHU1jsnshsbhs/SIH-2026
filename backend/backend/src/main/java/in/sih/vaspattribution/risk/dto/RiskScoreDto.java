package in.sih.vaspattribution.risk.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RiskScoreDto {
    private String chain;
    private String address;
    private Double score;
    private String category;
}
