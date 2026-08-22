package com.example.NextRider_Driver.Controller;

import com.example.NextRider_Driver.DTO.Request.StatusChangeRequest;
import com.example.NextRider_Driver.DTO.Response.DriverLocationResponse;
import com.example.NextRider_Driver.Response.ApiResponse;
import com.example.NextRider_Driver.Service.DriverWriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/rider/others")
@RequiredArgsConstructor
public class DriverController {

    private final DriverWriteService driverWriteService;

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
}
