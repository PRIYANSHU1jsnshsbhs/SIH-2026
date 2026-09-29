package in.sih.vaspattribution.investigation.entity;

import in.sih.vaspattribution.entity.entity.VaspEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "investigation_nodes")
@Getter
@Setter
public class InvestigationNode {
    
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investigation_id", nullable = false)
    private Investigation investigation;

    @Column(nullable = false)
    private String chain;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Integer hop;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "entity_id")
    private VaspEntity entity;

    @Column(name = "risk_score")
    private Integer riskScore;
}
