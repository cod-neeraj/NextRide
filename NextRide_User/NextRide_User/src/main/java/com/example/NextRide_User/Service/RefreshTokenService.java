package com.example.NextRide_User.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RedisTemplate<String, String> redisTemplate;

    private static final String PREFIX = "refresh:";

    public void storeRefreshToken(UUID userId, String refreshToken) {
        String key = PREFIX + userId.toString();
        redisTemplate.opsForValue().set(
                key,
                refreshToken,
                7, TimeUnit.DAYS
        );
    }

    public boolean isValid(UUID userId, String refreshToken) {
        String key = PREFIX + userId.toString();
        String stored = redisTemplate.opsForValue().get(key);
        return refreshToken.equals(stored);
    }

    public void deleteRefreshToken(UUID userId) {
        redisTemplate.delete(PREFIX + userId.toString());
    }
}
