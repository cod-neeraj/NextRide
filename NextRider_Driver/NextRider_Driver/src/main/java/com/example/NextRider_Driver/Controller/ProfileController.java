package com.example.NextRider_Driver.Controller;

import com.example.NextRider_Driver.DTO.Request.RegisterProfile;
import com.example.NextRider_Driver.DTO.Response.DriverProfileResponse;
import com.example.NextRider_Driver.Response.ApiResponse;
import com.example.NextRider_Driver.Service.DriverWriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rider/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final DriverWriteService driverWriteService;


    @PostMapping("/me")
    public ResponseEntity<ApiResponse<DriverProfileResponse>> saveProfile(@RequestBody @Valid RegisterProfile registerProfile,
                                        @AuthenticationPrincipal UserDetails userDetails){
        String phone = userDetails.getUsername();
        DriverProfileResponse driverProfileResponse = driverWriteService.registerProfileDriver(registerProfile,phone);
        return ResponseEntity.ok(ApiResponse.<DriverProfileResponse>builder()
                .data(driverProfileResponse)
                .success(true)
                .message("Profile Created Successfully")
                .build()
        );


    }
}
