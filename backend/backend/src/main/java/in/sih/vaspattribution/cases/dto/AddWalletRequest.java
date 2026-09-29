package in.sih.vaspattribution.cases.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddWalletRequest {
    @NotBlank(message = "Chain is required")
    private String chain;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    private String label;
    private String source;
}
