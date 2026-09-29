package in.sih.vaspattribution.risk.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "risk_scores")
@Getter
@Setter
public class RiskScore {

    @Id
    private UUID id;

    @Column(name = "wallet_chain", nullable = false)
    private String walletChain;

    @Column(name = "wallet_address", nullable = false)
    private String walletAddress;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel;

    @Column(name = "model_version", nullable = false)
    private String modelVersion;

    private String reasons;

    @CreationTimestamp
    @Column(name = "calculated_at", updatable = false)
    private OffsetDateTime calculatedAt;
}
