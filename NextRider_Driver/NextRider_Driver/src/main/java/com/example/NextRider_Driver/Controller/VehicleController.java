package com.example.NextRider_Driver.Controller;

import com.example.NextRider_Driver.DTO.Request.StatusChangeRequest;
import com.example.NextRider_Driver.DTO.Request.VehicleRequest;
import com.example.NextRider_Driver.DTO.Response.DriverVehicleResponse;
import com.example.NextRider_Driver.Response.ApiResponse;
import com.example.NextRider_Driver.Service.DriverVehicleWriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.apache.kafka.shaded.com.google.protobuf.Api;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.sql.Driver;
import java.util.UUID;

@RestController
@RequestMapping("/api/rider/vehicle")
@RequiredArgsConstructor
public class VehicleController {
    private final DriverVehicleWriteService driverVehicleWriteService;


    @PostMapping("/register")
    public ResponseEntity<ApiResponse<DriverVehicleResponse>> registerVehicle(@AuthenticationPrincipal UUID userId,
                                                                              @RequestBody @Valid VehicleRequest vehicleRequest){
        DriverVehicleResponse driverVehicleResponse = driverVehicleWriteService.registerDriverVehicle(vehicleRequest,userId);
        return ResponseEntity.ok(ApiResponse.<DriverVehicleResponse>builder()
                .data(driverVehicleResponse)
                .success(true)
                .message("Vehicle Registered Successfully Wait for Verification")
                .build());
    }

}
