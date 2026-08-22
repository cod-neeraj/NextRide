package com.example.NextRider_Driver.Service;

import com.example.NextRider_Driver.DTO.Response.DashBoardMainResponse;
import com.example.NextRider_Driver.DTO.Response.DriverRideResponse;
import com.example.NextRider_Driver.FeignInterface.RideService;
import com.example.NextRider_Driver.Repository.DriverStatsRepository;
import com.example.NextRider_Driver.Response.ApiResponse;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.sql.Driver;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
@Slf4j
public class DashBoardReadService {
    private final DriverStatsRepository driverStatsRepository;
    private final RideService rideService;

    public DashBoardMainResponse findDashBoardDetails(UUID driverId) {

        System.out.println(driverId);
        Object[] obj = driverStatsRepository.findTodayStats(driverId);
        Object[] obj1 = (Object[]) obj[0];

        Long totalRides = 0L;
        Double earnings = 0.0;
        Double rating = 0.0;

        if (obj1 != null) {
            totalRides = obj[0] != null ? (Long) obj1[0] : 0L;
            earnings = obj[1] != null ? (Double) obj1[1] : 0.0;
            rating = obj[2] != null ? (Double) obj1[2] : 0.0;
        }

        List<DriverRideResponse> recentRides = fetchRecentRidesSafely(driverId);

        return DashBoardMainResponse.builder()
                .averageRatings(rating)
                .todayEarnings(earnings)
                .todayTotalRides(totalRides)
                .driverRideResponseList(recentRides)
                .build();
    }

    private List<DriverRideResponse> fetchRecentRidesSafely(UUID driverId) {
        try {
            ResponseEntity<ApiResponse<List<DriverRideResponse>>> response =
                    rideService.getTodayRides(driverId);

            if (response != null
                    && response.getStatusCode().is2xxSuccessful()
                    && response.getBody() != null
                    && response.getBody().getData() != null) {
                return response.getBody().getData();
            }
            return Collections.emptyList();

        } catch (Exception e) {
            log.warn("Failed to fetch recent rides for driver {}: {}", driverId, e.getMessage());
            return Collections.emptyList();
        }
    }
}
