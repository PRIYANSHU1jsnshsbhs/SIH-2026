package in.sih.vaspattribution.cases.entity;

import in.sih.vaspattribution.auth.entity.User;
import in.sih.vaspattribution.entity.entity.VaspEntity;
import in.sih.vaspattribution.investigation.entity.Investigation;
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
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "vasp_requests")
@Getter
@Setter
public class VaspRequest {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private Case aCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investigation_id")
    private Investigation investigation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entity_id", nullable = false)
    private VaspEntity entity;

    @Column(name = "request_type", nullable = false)
    private String requestType;

    @Column(nullable = false)
    private String status;

    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
