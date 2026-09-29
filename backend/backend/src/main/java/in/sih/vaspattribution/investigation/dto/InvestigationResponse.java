package in.sih.vaspattribution.investigation.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class InvestigationResponse {
    private UUID id;
    private UUID caseId;
    private String title;
    private String status;
    private List<NodeDto> nodes;
    private List<EdgeDto> edges;

    @Data
    @Builder
    public static class NodeDto {
        private String id;
        private String chain;
        private String address;
        private String entityName;
        private String entityType;
        private UUID entityId;
        private boolean isVasp;
        private Double riskScore;
    }

    @Data
    @Builder
    public static class EdgeDto {
        private String id;
        private String source;
        private String target;
        private String txHash;
        private java.math.BigDecimal value;
        private String asset;
    }
}
