package com.example.NextRider_Driver.Controller;

import com.example.NextRider_Driver.DTO.Response.DashBoardMainResponse;
import com.example.NextRider_Driver.Response.ApiResponse;
import com.example.NextRider_Driver.Service.DashBoardReadService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/driver")
@AllArgsConstructor
public class DashBoardController {

    private final DashBoardReadService dashBoardReadService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashBoardMainResponse>> getDashboardDetails(
            Authentication authentication) {

        UUID driverId = (UUID) authentication.getPrincipal();

        DashBoardMainResponse response = dashBoardReadService.findDashBoardDetails(driverId);

        return ResponseEntity.ok(
                ApiResponse.<DashBoardMainResponse>builder()
                        .success(true)
                        .message("Dashboard fetched successfully")
                        .data(response)
                        .build()
        );
    }


}
