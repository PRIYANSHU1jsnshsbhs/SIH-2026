package in.sih.vaspattribution.investigation.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "investigation_edges")
@Getter
@Setter
public class InvestigationEdge {
    
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investigation_id", nullable = false)
    private Investigation investigation;

    @Column(nullable = false)
    private String chain;

    @Column(name = "tx_hash", nullable = false)
    private String txHash;

    @Column(name = "source_chain", nullable = false)
    private String sourceChain;

    @Column(name = "source_address", nullable = false)
    private String sourceAddress;

    @Column(name = "target_chain", nullable = false)
    private String targetChain;

    @Column(name = "target_address", nullable = false)
    private String targetAddress;

    private String asset;

    @Column(precision = 38, scale = 18)
    private java.math.BigDecimal amount;

    private OffsetDateTime timestamp;
}
