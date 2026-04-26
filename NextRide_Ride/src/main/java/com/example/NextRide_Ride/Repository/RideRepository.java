package com.example.NextRide_Ride.Repository;

import com.example.NextRide_Ride.Models.Entity.Ride;
import com.example.NextRide_Ride.Models.Enums.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RideRepository extends JpaRepository<Ride, UUID> {

    List<Ride> findByStatus(RideStatus rideStatus);
}
