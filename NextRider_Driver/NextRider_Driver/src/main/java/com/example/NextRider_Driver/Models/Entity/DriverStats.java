package com.example.NextRider_Driver.Models.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "driver_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverStats {

    @Id
    private UUID driverId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "driver_id")
    private DriverProfile driver;

    private Long totalRides;
    private Long completedRides;
    private Long cancelledRides;

    private Double totalEarnings;
    private Double todayEarnings;
    private Double weeklyEarnings;

    private Double averageRating;
    private Long totalRatings;

    private Double acceptanceRate;
    private Double cancellationRate;

    private LocalDateTime lastRideAt;
    private LocalDateTime updatedAt;
}