package com.example.NextRide_Ride.Controller;

import com.example.NextRide_Ride.DTO.Request.RideRequest;
import com.example.NextRide_Ride.DTO.Response.RideResponse;
import com.example.NextRide_Ride.Response.ApiResponse;
import com.example.NextRide_Ride.Service.RideWriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ride")
@RequiredArgsConstructor
public class RideController {

    private final RideWriteService rideWriteService;



    @PostMapping("/request")
    public ResponseEntity<ApiResponse<RideResponse>> requestRide(@RequestBody @Valid RideRequest rideRequest){
        RideResponse rideResponse = rideWriteService.requestRide(rideRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<RideResponse>builder()
                .data(rideResponse)
                .message("Requested Ride")
                .success(true)
                .build()
        );
    }

}
