package com.example.NextRide_Notification.WebSocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionManager {

    private final StringRedisTemplate redisTemplate;

    public void userConnected(String userId, String userType) {
        redisTemplate.opsForValue().set("ws:online:" + userId, userType); // DRIVER or RIDER
        log.info("{} {} connected", userType, userId);
    }

    public void userDisconnected(String userId) {
        redisTemplate.delete("ws:online:" + userId);
        log.info("User {} disconnected", userId);
    }

    public boolean isOnline(String userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("ws:online:" + userId));
    }
}