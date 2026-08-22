package com.example.NextRide_Ride.Service;

import com.example.NextRide_Ride.DTO.Request.RideRequest;
import com.example.NextRide_Ride.DTO.Response.RideResponse;
import com.example.NextRide_Ride.Mapper.RideMapper;
import com.example.NextRide_Ride.Models.Entity.Ride;
import com.example.NextRide_Ride.Models.Enums.RideStatus;
import com.example.NextRide_Ride.Repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RideWriteService {
    private final RideMapper rideMapper;
    private final RideRepository rideRepository;


    public RideResponse requestRide(RideRequest rideRequest){
        Ride ride = rideMapper.toEntity(rideRequest);
        ride.setStatus(RideStatus.REQUESTED);
        ride.setRequestedAt(Instant.now());
        rideRepository.save(ride);
        RideResponse rideResponse = rideMapper.toResponse(ride);
        return rideResponse;

    }


}
