package com.example.NextRide_Ride.Mapper;

import com.example.NextRide_Ride.DTO.Request.RideRequest;
import com.example.NextRide_Ride.DTO.Response.RideResponse;
import com.example.NextRide_Ride.Models.Entity.Ride;

@Mapper(componentModel = "spring")
public interface RideMapper {

    Ride toEntity(RideRequest rideRequest);
    RideResponse toResponse(Ride ride);

}
