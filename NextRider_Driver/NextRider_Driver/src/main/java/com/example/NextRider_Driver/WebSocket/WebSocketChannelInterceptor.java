package com.example.NextRider_Driver.WebSocket;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketChannelInterceptor implements ChannelInterceptor {

    private final SessionManager sessionManager;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor
                .getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        switch (accessor.getCommand() != null ? accessor.getCommand() : StompCommand.ERROR) {

            case CONNECT -> {
                log.info("CONNECT HEADERS: {}", accessor.toNativeHeaderMap());
                Principal principal = accessor.getUser();

                String userId = principal.getName();
                String userType  = "DRIVER";
                String sessionId = accessor.getSessionId();

                log.info("userId={}, userType={}, sessionId={}", userId, userType, sessionId);

                if (userId != null && userType != null) {
                    sessionManager.storeSessionUserType(sessionId, userType);
                    sessionManager.userConnected(userId, userType);

                    // Store in session so controllers read it without Redis
                    accessor.getSessionAttributes().put("userId", userId);
                    accessor.getSessionAttributes().put("userType", userType);

                    log.info("STOMP CONNECT — userId={} userType={}", userId, userType);
                } else {
                    log.warn("STOMP CONNECT missing headers — sessionId={}", sessionId);
                }
            }

            case DISCONNECT -> {
                String sessionId = accessor.getSessionId();
                String userId = (String) accessor.getSessionAttributes().get("userId");

                if (userId != null) {
                    sessionManager.userDisconnected(userId, sessionId);
                    log.info("STOMP DISCONNECT — userId={}", userId);
                }
            }

            default -> { /* ignore SUBSCRIBE, SEND, etc. */ }
        }

        return message;
    }
}