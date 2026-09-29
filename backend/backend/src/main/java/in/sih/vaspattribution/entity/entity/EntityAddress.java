package in.sih.vaspattribution.entity.entity;

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
@Table(name = "entity_addresses")
@Getter
@Setter
public class EntityAddress {
    
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "entity_id", nullable = false)
    private VaspEntity entity;

    @Column(nullable = false)
    private String chain;

    @Column(nullable = false)
    private String address;

    @Column(name = "label_type")
    private String labelType;

    private Double confidence;

    private String source;

    @Column(name = "last_verified")
    private OffsetDateTime lastVerified;
}
