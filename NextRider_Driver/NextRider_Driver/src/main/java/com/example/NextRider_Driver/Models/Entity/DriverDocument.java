package com.example.NextRider_Driver.Models.Entity;
import com.example.NextRider_Driver.Models.Enums.DocumentType;
import com.example.NextRider_Driver.Models.Enums.VerificationStatus;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "driver_document")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverDocument {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private DriverProfile driver;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    private String documentNumber;
    private String documentUrl;

    private LocalDate issuedDate;
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus;

    private UUID verifiedBy;
    private LocalDateTime verifiedAt;

    private String rejectionReason;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @CreationTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = UuidCreator.getTimeOrderedEpoch();
        }
    }
}
