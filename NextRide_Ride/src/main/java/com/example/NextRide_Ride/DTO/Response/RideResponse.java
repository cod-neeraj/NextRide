package com.example.NextRide_Ride.DTO.Response;

import com.example.NextRide_Ride.Models.Enums.RideStatus;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RideResponse {
    private UUID id;
    private UUID riderId;
    private UUID driverId;
    private RideStatus status;
    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;
    private Instant requestedAt;


}
