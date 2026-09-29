package in.sih.vaspattribution.entity.entity;

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
@Table(name = "entities")
@Getter
@Setter
public class VaspEntity {
    
    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    private String jurisdiction;

    private String website;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
