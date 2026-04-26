package com.example.NextRider_Driver.Repository;

import com.example.NextRider_Driver.Models.Entity.DriverProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverProfileRepository extends JpaRepository<DriverProfile, UUID> {

    Optional<DriverProfile> findByPhoneNumber(String phoneNumber);
}
