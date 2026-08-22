package com.example.NextRider_Driver.WebSocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionManager {

    private final StringRedisTemplate redisTemplate;

    public void storeSessionUserType(String sessionId, String userType) {
        redisTemplate.opsForValue().set("ws:session:" + sessionId, userType);
    }

    public String getSessionUserType(String sessionId) {
        return redisTemplate.opsForValue().get("ws:session:" + sessionId);
    }

    public void removeSession(String sessionId) {

        redisTemplate.delete("ws:session:" + sessionId);
    }

    public void userConnected(String userId, String userType) {
        redisTemplate.opsForValue().set("ws:online:" + userId, userType);
        redisTemplate.opsForSet().add("ws:type:" + userType, userId);
        log.info("{} {} connected", userType, userId);
    }

    public void userDisconnected(String userId, String sessionId) {
        String userType = redisTemplate.opsForValue().get("ws:online:" + userId);
        if (userType != null) {
            redisTemplate.opsForSet().remove("ws:type:" + userType, userId);
        }
        redisTemplate.delete("ws:online:" + userId);
        redisTemplate.delete("ws:session:" + sessionId);
        log.info("User {} disconnected", userId);
    }

    public boolean isOnline(String userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("ws:online:" + userId));
    }

    public Set<String> getUsersByType(String userType) {
        Set<String> members = redisTemplate.opsForSet().members("ws:type:" + userType);
        return members != null ? members : Collections.emptySet();
    }
}