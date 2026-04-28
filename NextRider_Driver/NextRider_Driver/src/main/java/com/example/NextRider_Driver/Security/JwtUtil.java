package com.example.NextRider_Driver.Security;

import com.example.NextRider_Driver.Models.Entity.DriverProfile;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
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


    public UUID extractUserId(String token) {
        String userId = extractClaim(token,
                claims -> claims.get("userId", String.class)); // get as String
        return UUID.fromString(userId);                    // convert to UUID
    }

    // Extract role
    public String extractRole(String token) {
        return extractClaim(token,
                claims -> claims.get("role", String.class));
    }
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token); // this verifies signature
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
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

}