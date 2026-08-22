package com.example.NextRider_Driver.DTO.Response;

import com.example.NextRider_Driver.Models.Enums.RideStatus;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DriverRideResponse {
    private UUID id;
    private RideStatus status;
    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;
}

