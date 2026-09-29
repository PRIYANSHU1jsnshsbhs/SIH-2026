package in.sih.vaspattribution.investigation.entity;

import in.sih.vaspattribution.cases.entity.Case;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "investigations")
@Getter
@Setter
public class Investigation {
    
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Case aCase;

    @Column(name = "start_chain", nullable = false)
    private String startChain;

    @Column(name = "start_address", nullable = false)
    private String startAddress;

    @Column(name = "max_hops", nullable = false)
    private Integer maxHops;

    @Column(name = "min_value", precision = 38, scale = 18)

    private java.math.BigDecimal minValue;

    @Column(name = "from_date")
    private OffsetDateTime fromDate;

    @Column(name = "to_date")
    private OffsetDateTime toDate;

    @Column(nullable = false)
    private String status;

    private Integer progress;

    @Column(name = "current_stage")
    private String currentStage;

    @Column(name = "nodes_found")
    private Integer nodesFound = 0;

    @Column(name = "edges_found")
    private Integer edgesFound = 0;

    @Column(name = "error_message")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "started_at")
    private OffsetDateTime startedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
}
