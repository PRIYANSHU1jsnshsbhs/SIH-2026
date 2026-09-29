package in.sih.vaspattribution.cases.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class CaseWalletDto {
    private UUID id;
    private UUID caseId;
    private String chain;
    private String address;
    private String label;
    private String source;
    private OffsetDateTime createdAt;
}
