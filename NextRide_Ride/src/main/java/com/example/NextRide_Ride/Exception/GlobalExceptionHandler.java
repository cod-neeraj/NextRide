package com.example.NextRide_Ride.Exception;

import com.example.NextRide_Ride.Response.ApiError;
//import io.jsonwebtoken.ExpiredJwtException;
//import io.jsonwebtoken.MalformedJwtException;
//import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> fieldErrors.put(
                        e.getField(),
                        e.getDefaultMessage()
                ));

        ApiError error = ApiError.builder()
                .status(400)
                .error("VALIDATION_FAILED")
                .message("Request validation failed")
                .timestamp(Instant.now())
                .path(request.getRequestURI())
                .fieldErrors(fieldErrors)
                .build();

        return ResponseEntity.badRequest().body(error);
    }

    // ─── 3. Duplicate email ───────────────────────────────────────────────────
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleEmailExists(
            EmailAlreadyExistsException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.builder()
                        .status(409)
                        .error("EMAIL_ALREADY_EXISTS")
                        .message(ex.getMessage())
                        .timestamp(Instant.now())
                        .path(request.getRequestURI())
                        .build());
    }

    // ─── 4. Duplicate phone ───────────────────────────────────────────────────
    @ExceptionHandler(PhoneAlreadyExistsException.class)
    public ResponseEntity<ApiError> handlePhoneExists(
            PhoneAlreadyExistsException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.builder()
                        .status(409)
                        .error("PHONE_ALREADY_EXISTS")
                        .message(ex.getMessage())
                        .timestamp(Instant.now())
                        .path(request.getRequestURI())
                        .build());
    }
    @ExceptionHandler(LongLatNullException.class)
    public ResponseEntity<ApiError> longLatNull(
           LongLatNullException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.builder()
                        .status(409)
                        .error("Longitude or Latitude is Null")
                        .message(ex.getMessage())
                        .timestamp(Instant.now())
                        .path(request.getRequestURI())
                        .build());
    }
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> handleCredentials(
            InvalidCredentialsException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiError.builder()
                        .status(401)
                        .error("Invalid Credentials")
                        .message(ex.getMessage())
                        .timestamp(Instant.now())
                        .path(request.getRequestURI())
                        .build());
    }

    @ExceptionHandler(UserNotExistException.class)
    public ResponseEntity<ApiError> handleUserExists(
            UserNotExistException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.builder()
                        .status(404)
                        .error("User Not Exist")
                        .message(ex.getMessage())
                        .timestamp(Instant.now())
                        .path(request.getRequestURI())
                        .build());
    }

    // ─── 6. Account suspended ─────────────────────────────────────────────────
    @ExceptionHandler(AccountSuspendedException.class)
    public ResponseEntity<ApiError> handleSuspended(
            AccountSuspendedException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiError.builder()
                        .status(403)
                        .error("ACCOUNT_SUSPENDED")
                        .message(ex.getMessage())
                        .timestamp(Instant.now())
                        .path(request.getRequestURI())
                        .build());
    }

//    // ─── 7. JWT expired ───────────────────────────────────────────────────────
//    @ExceptionHandler(ExpiredJwtException.class)
//    public ResponseEntity<ApiError> handleExpiredJwt(
//            ExpiredJwtException ex,
//            HttpServletRequest request) {
//
//        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                .body(ApiError.builder()
//                        .status(401)
//                        .error("TOKEN_EXPIRED")
//                        .message("Access token has expired")
//                        .timestamp(Instant.now())
//                        .path(request.getRequestURI())
//                        .build());
//    }

    // ─── 8. JWT invalid / malformed ───────────────────────────────────────────
    @ExceptionHandler({
            InvalidTokenException.class
    })
    public ResponseEntity<ApiError> handleInvalidJwt(
            RuntimeException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiError.builder()
                        .status(401)
                        .error("INVALID_TOKEN")
                        .message("Token is invalid or tampered")
                        .timestamp(Instant.now())
                        .path(request.getRequestURI())
                        .build());
    }

    // ─── 9. Access denied (wrong role) ───────────────────────────────────────
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiError.builder()
                        .status(403)
                        .error("ACCESS_DENIED")
                        .message("You do not have permission to access this resource")
                        .timestamp(Instant.now())
                        .path(request.getRequestURI())
                        .build());
    }

    // ─── 10. Wrong path variable type ─────────────────────────────────────────
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request) {

        return ResponseEntity.badRequest()
                .body(ApiError.builder()
                        .status(400)
                        .error("INVALID_PARAMETER")
                        .message("Invalid value for parameter: " + ex.getName())
                        .timestamp(Instant.now())
                        .path(request.getRequestURI())
                        .build());
    }

    // ─── 11. Catch all — last resort ──────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleAll(
            Exception ex,
            HttpServletRequest request) {

        // Log full stack trace internally — never send to client
        log.error("Unexpected error at {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.builder()
                        .status(500)
                        .error("INTERNAL_SERVER_ERROR")
                        .message("Something went wrong. Please try again later.")
                        .timestamp(Instant.now())
                        .path(request.getRequestURI())
                        .build());
    }
}