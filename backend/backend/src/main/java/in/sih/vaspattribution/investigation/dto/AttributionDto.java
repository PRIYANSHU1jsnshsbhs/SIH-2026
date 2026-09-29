package in.sih.vaspattribution.investigation.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;
import java.util.List;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttributionDto {
    private UUID entityId;
    private String entityName;
    private String entityType;
    private String chain;
    private String destinationAddress;
    private int hopCount;
    private java.math.BigDecimal amount;
    private String asset;
    private Double confidence;
    private String path;
    private List<String> transactions;
    private String evidence;
}
