package com.example.NextRider_Driver.Models.Entity;
import com.example.NextRider_Driver.Models.Enums.DriverStatus;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "driver_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverProfile {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    private UUID userId;

    @Column(nullable = false)
    private String fullName;


    private String profilePhotoUrl;

    @Enumerated(EnumType.STRING)
    private DriverStatus status;

    private Double currentLat;
    private Double currentLng;

    private String street;
    private String city;
    private String state;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private LocalDateTime lastActiveAt;

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = UuidCreator.getTimeOrderedEpoch();
        }
    }
}