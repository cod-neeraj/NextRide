package com.example.NextRider_Driver.Repository;

import com.example.NextRider_Driver.Models.Entity.DriverProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverProfileRepository extends JpaRepository<DriverProfile, UUID> {

    Optional<DriverProfile> findByUserId(UUID userId);
    @Query("""
            SELECT d.rating FROM DriverProfile d WHERE d.userId=:userId
            """)
    Double findRatings(@Param("userId") UUID userId);

}
