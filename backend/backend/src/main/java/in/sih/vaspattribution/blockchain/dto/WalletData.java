package in.sih.vaspattribution.blockchain.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WalletData {
    private String chain;
    private String address;
    private java.math.BigDecimal balance;
    private Integer transactionCount;
    private String firstTxDate;
    private String lastTxDate;
}
