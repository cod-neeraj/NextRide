package com.example.NextRide_User.Controller;

import com.example.NextRide_User.DTO.Response.UserResponse;
import com.example.NextRide_User.Response.ApiResponse;
import com.example.NextRide_User.Service.UserReadService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@AllArgsConstructor
public class RefreshController {

    private final UserReadService userReadService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        UserResponse user = userReadService.me(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true).message("Current user fetched").data(user).build());
    }
}
