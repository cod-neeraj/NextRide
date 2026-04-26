package com.example.NextRider_Driver.Controller;

import com.example.NextRider_Driver.DTO.Request.LocationChangeRequest;
import com.example.NextRider_Driver.DTO.Request.RegisterProfile;
import com.example.NextRider_Driver.DTO.Request.StatusChangeRequest;
import com.example.NextRider_Driver.DTO.Response.DriverLocationResponse;
import com.example.NextRider_Driver.DTO.Response.DriverProfileResponse;
import com.example.NextRider_Driver.Response.ApiResponse;
import com.example.NextRider_Driver.Service.DriverWriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.annotation.InterfaceStability;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/rider/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final DriverWriteService driverWriteService;


    @PostMapping("/me")
    public ResponseEntity<ApiResponse<DriverProfileResponse>> saveProfile(@RequestBody @Valid RegisterProfile registerProfile,
                                        @AuthenticationPrincipal UUID userId) {
        DriverProfileResponse driverProfileResponse = driverWriteService.registerProfileDriver(registerProfile,userId);
        return ResponseEntity.ok(ApiResponse.<DriverProfileResponse>builder()
                .data(driverProfileResponse)
                .success(true)
                .message("Profile Created Successfully")
                .build()
        );
    }

    @PatchMapping("/status")
    public ResponseEntity<ApiResponse<DriverLocationResponse>> changeStatus(@AuthenticationPrincipal UUID userId,
                                                                                @RequestBody @Valid StatusChangeRequest statusChangeRequest){

            DriverLocationResponse driverLocationResponse = driverWriteService.statusChange(userId,statusChangeRequest);
            return ResponseEntity.ok(ApiResponse.<DriverLocationResponse>builder()
                    .data(driverLocationResponse)
                    .message("Update status")
                    .success(true)
                    .build()
            );

        }


    @PatchMapping("/locationChange")
    public ResponseEntity<ApiResponse<String>> changeLocation(@AuthenticationPrincipal UUID userId,
                                                        @RequestBody @Valid LocationChangeRequest locationChangeRequest){

        driverWriteService.locationChange(userId,locationChangeRequest);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .data("Updated location")
                .message("updated")
                .success(true)
                .build()
        );
        }



}
