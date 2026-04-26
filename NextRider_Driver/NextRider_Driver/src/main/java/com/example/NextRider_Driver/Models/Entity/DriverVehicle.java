package com.example.NextRider_Driver.Models.Entity;
import com.example.NextRider_Driver.Models.Enums.FuelType;
import com.example.NextRider_Driver.Models.Enums.VehicleType;
import com.example.NextRider_Driver.Models.Enums.VerificationStatus;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "driver_vehicle")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverVehicle {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private DriverProfile driver;

    @Enumerated(EnumType.STRING)
    private VehicleType vehicleType;

    @Column(nullable = false)
    private String brand;
    @Column(nullable = false)
    private String model;
    @Column(nullable = false)
    private String color;

    @Column(unique = true)
    private String registrationNumber;

    @Column(nullable = false)
    private String registrationState;
    @Column(nullable = false)
    private Integer manufactureYear;

    @Enumerated(EnumType.STRING)
    private FuelType fuelType;

    private VerificationStatus status;


    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = UuidCreator.getTimeOrderedEpoch();
        }
    }
}