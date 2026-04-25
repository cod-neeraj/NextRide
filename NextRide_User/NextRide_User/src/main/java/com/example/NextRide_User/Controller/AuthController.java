package com.example.NextRide_User.Controller;

import com.example.NextRide_User.DTO.Request.UserLogin;
import com.example.NextRide_User.DTO.Request.UserRegister;
import com.example.NextRide_User.DTO.Response.AuthResponse;
import com.example.NextRide_User.DTO.Response.UserResponse;
import com.example.NextRide_User.Response.ApiResponse;
import com.example.NextRide_User.Security.JwtUtil;
import com.example.NextRide_User.Service.RefreshTokenService;
import com.example.NextRide_User.Service.UserReadService;
import com.example.NextRide_User.Service.UserWriteService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserWriteService userWriteService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final UserReadService userReadService;



    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody @Valid UserRegister userRegister,
                                                              HttpServletResponse httpResponse){
        AuthResponse user = userWriteService.registerUser(userRegister);
        if(user != null){
            Cookie accessCookie = new Cookie("access_token",
                    user.getAccessToken());
            accessCookie.setHttpOnly(true);
            accessCookie.setSecure(false);
            accessCookie.setPath("/");
            accessCookie.setMaxAge(900);

            httpResponse.addCookie(accessCookie);

            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                    .success(true)
                    .message("Register Successfully")
                    .data(user)
                    .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }else{
            ApiResponse<AuthResponse> response = ApiResponse.<AuthResponse>builder()
                    .success(false)
                    .message("Not Get Register")
                    .data(null)
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody @Valid UserLogin userLogin,
                      HttpServletResponse httpServletResponse){
        AuthResponse authResponse = userWriteService.login(userLogin);

        Cookie accessCookie = new Cookie("access_token",
                authResponse.getAccessToken());
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(900);
        httpServletResponse.addCookie(accessCookie);

        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Login successful")
                        .data(authResponse)
                        .build()
        );


    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        Cookie cookie = new Cookie("access_token", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        String token = extractTokenFromCookie(request);
        if (token != null) {
            UUID userId = jwtUtil.extractUserId(token);
            refreshTokenService.deleteRefreshToken(userId);
        }

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Logged out successfully")
                        .data(null)
                        .build());
    }

    private String extractTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> "access_token".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    @GetMapping("/verify-token")
    public ResponseEntity<ApiResponse<UserResponse>> verifyToken(
            @AuthenticationPrincipal UserDetails userDetails) {
        String phone = userDetails.getUsername();
        UserResponse user = userReadService.me(phone);
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message("Token valid")
                        .data(user)
                        .build()
        );
    }


}
