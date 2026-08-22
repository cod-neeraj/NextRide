package com.example.NextRide_Ride.Kafka.Request;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RideRequestDriver {
    private UUID rideId;
    private Double pickUpLat;
    private Double pickUpLon;
    private Double dropOffLat;
    private Double dropOffLon;
    private List<String> driverIds;
}
