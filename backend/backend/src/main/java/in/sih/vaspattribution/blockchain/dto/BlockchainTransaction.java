package in.sih.vaspattribution.blockchain.dto;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class BlockchainTransaction {
    private String chain;
    private String txHash;
    private Long block;
    private OffsetDateTime timestamp;
    private String fromAddress;
    private String toAddress;
    private java.math.BigDecimal value;
    private String asset;
    private String status;
    private List<TokenTransfer> tokenTransfers;

    @Data
    @Builder
    public static class TokenTransfer {
        private String fromAddress;
        private String toAddress;
        private java.math.BigDecimal amount;
        private String asset;
    }
}
