package com.example.NextRide_User.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import com.example.NextRide_User.Models.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.*;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("role",   user.getRole().name());
        return buildToken(claims, user.getPhone());
    }

    private String buildToken(Map<String, Object> extraClaims, String subject) {
        return Jwts.builder()
                .claims(extraClaims)           // new API
                .subject(subject)              // new API
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    // Extract email (subject)
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extract userId — you will use this in every protected API
    public UUID extractUserId(String token) {
        String userId = extractClaim(token,
                claims -> claims.get("userId", String.class));
        return UUID.fromString(userId);
    }

    // Extract role
    public String extractRole(String token) {
        return extractClaim(token,
                claims -> claims.get("role", String.class));
    }

    public long getExpirationMs() {
        return jwtExpirationMs;
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getSigningKey()) // new API
                .build()
                .parseSignedClaims(token)                // new API
                .getPayload();                           // new API
    }

    private java.security.Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("type", "REFRESH");   // mark it as refresh token
        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // Check if token is refresh type
    public boolean isRefreshToken(String token) {
        String type = extractClaim(token,
                claims -> claims.get("type", String.class));
        return "REFRESH".equals(type);
    }
}