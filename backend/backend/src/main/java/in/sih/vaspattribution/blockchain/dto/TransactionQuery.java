package in.sih.vaspattribution.blockchain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionQuery {
    private String direction;
    private String asset;
    private OffsetDateTime fromDate;
    private OffsetDateTime toDate;
    private java.math.BigDecimal minValue;
    private Integer page;
    private Integer limit;
}
