package com.example.NextRider_Driver.DTO.Request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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