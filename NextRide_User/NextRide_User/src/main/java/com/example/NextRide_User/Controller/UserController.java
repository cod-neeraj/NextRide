package com.example.NextRide_User.Controller;

import com.example.NextRide_User.DTO.Request.PasswordChange;
import com.example.NextRide_User.DTO.Request.UpdateProfile;
import com.example.NextRide_User.DTO.Response.UserResponse;
import com.example.NextRide_User.Response.ApiError;
import com.example.NextRide_User.Response.ApiResponse;
import com.example.NextRide_User.Service.UserReadService;
import com.example.NextRide_User.Service.UserWriteService;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.hibernate.sql.Update;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserReadService userReadService;
    private final UserWriteService userWriteService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal UserDetails userDetails){
        String phoneNumber = userDetails.getUsername();
        UserResponse userResponse = userReadService.me(phoneNumber);
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.<UserResponse>builder()
                        .data(userResponse)
                        .message("User Found")
                        .success(true)
                        .build()
        );

    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@RequestBody @Valid UpdateProfile updateProfile,
                                                             @AuthenticationPrincipal UserDetails userDetails){
        String phoneNumber = userDetails.getUsername();
       UserResponse userResponse = userWriteService.updateProfile(updateProfile,phoneNumber);
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.<UserResponse>builder()
                        .data(userResponse)
                        .message("User Found")
                        .success(true)
                        .build()
        );

    }

    @PatchMapping("me/password")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody @Valid PasswordChange passwordChange,
                                           @AuthenticationPrincipal UserDetails userDetails){
        String phoneNumber = userDetails.getUsername();
        userWriteService.changePassword(phoneNumber,passwordChange);
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.<String>builder()
                        .data("Password Updated")
                        .message("Password Updated")
                        .success(true)
                        .build()
        );


    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<String>> delete(@AuthenticationPrincipal UserDetails userDetails){
        String phoneNumber = userDetails.getUsername();
        userWriteService.softDeleteUser(phoneNumber);
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.<String>builder()
                        .data("Account Deleted")
                        .message("Account Deleted")
                        .success(true)
                        .build()
        );

    }
}
