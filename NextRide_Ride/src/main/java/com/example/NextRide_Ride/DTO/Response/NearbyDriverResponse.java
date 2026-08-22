package com.example.NextRide_Ride.DTO.Response;

import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NearbyDriverResponse {
    private UUID driverId;
    private Double distanceKm;
    private Double rating;
    private Double lat;
    private Double lng;
}