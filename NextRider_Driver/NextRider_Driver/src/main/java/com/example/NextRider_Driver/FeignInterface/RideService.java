package com.example.NextRider_Driver.FeignInterface;

import com.example.NextRider_Driver.DTO.Response.DriverRideResponse;
import com.example.NextRider_Driver.Response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;

@FeignClient(
        name = "ride-service",
        url = "http://localhost:2023"
)
public interface RideService {

    @GetMapping("/ride/rider/today-rides/{driverId}")
    ResponseEntity<ApiResponse<List<DriverRideResponse>>> getTodayRides(
            @PathVariable UUID driverId
    );
}