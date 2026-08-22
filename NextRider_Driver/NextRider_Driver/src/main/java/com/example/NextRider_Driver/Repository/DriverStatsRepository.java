package com.example.NextRider_Driver.Repository;

import com.example.NextRider_Driver.Models.Entity.DriverStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DriverStatsRepository extends JpaRepository<DriverStats, UUID> {
    @Query("""
            SELECT (s.todayTotalRides,s.todayEarnings,s.averageRating) FROM
            DriverStats s WHERE s.driverId=:driverId
            """)
    Object[] findTodayStats(@Param("driverId") UUID driverId);


}
