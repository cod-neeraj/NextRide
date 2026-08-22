package com.example.NextRide_User.Controller;

import com.example.NextRide_User.DTO.Request.UserLogin;
import com.example.NextRide_User.DTO.Request.UserRegister;
import com.example.NextRide_User.DTO.Response.AuthResponse;
import com.example.NextRide_User.DTO.Response.UserResponse;
import com.example.NextRide_User.Exception.InvalidCredentialsException;
import com.example.NextRide_User.Mapper.UserMapper;
import com.example.NextRide_User.Models.User;
import com.example.NextRide_User.Repository.UserRepository;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserWriteService userWriteService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final UserReadService userReadService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;



    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody @Valid UserRegister userRegister){
        UserResponse user = userWriteService.registerUser(userRegister);
        if(user != null){
            ApiResponse<UserResponse> response = ApiResponse.<UserResponse>builder()
                    .success(true)
                    .message("Register Successfully")
                    .data(user)
                    .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }else{
            ApiResponse<UserResponse> response = ApiResponse.<UserResponse>builder()
                    .success(false)
                    .message("Not Get Register")
                    .data(null)
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@RequestBody @Valid UserLogin userLogin,
                      HttpServletResponse httpServletResponse){
        AuthResponse authResponse = userWriteService.login(userLogin);

        ResponseCookie accessCookie = ResponseCookie.from("access_token", authResponse.getAccessToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(900)
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth/refresh")
                .maxAge(6 * 24 * 60 * 60)
                .build();

        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .success(true)
                        .message("Login successful")
                        .data(authResponse.getUserResponse())
                        .build()
        );


    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Void>> refresh(
            @CookieValue(value = "refresh_token", required = false) String refreshToken,
            HttpServletResponse httpServletResponse) {

        if (refreshToken == null) {
            throw new InvalidCredentialsException("Refresh token missing");
        }

        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new InvalidCredentialsException("Refresh token expired or invalid");
        }

        String userId = jwtUtil.extractUserId(refreshToken);

        if (!refreshTokenService.isValid(userId, refreshToken)) {
            throw new InvalidCredentialsException("Refresh token revoked or expired");
        }

        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        // 3. Issue a NEW access token
        String newAccessToken = jwtUtil.generateToken(user);

        // (Optional but recommended) rotate refresh token too — issue new one, invalidate old
        String newRefreshToken = jwtUtil.generateRefreshToken(user);
        refreshTokenService.storeRefreshToken(UUID.fromString(userId), newRefreshToken);

        // 4. Set new cookies
        ResponseCookie accessCookie = ResponseCookie.from("access_token", newAccessToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(900)
                .build();

        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", newRefreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth/refresh")
                .maxAge(6 * 24 * 60 * 60)
                .build();

        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Token refreshed")
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
            UUID userId = UUID.fromString(jwtUtil.extractUserId(token));
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
