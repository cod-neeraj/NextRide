package com.example.NextRide_Notification.Service;

import com.example.NextRide_Notification.WebSocket.SessionManager;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DriverStatus {

    private final SimpMessagingTemplate messagingTemplate;
    private final SessionManager sessionManager;

//    @KafkaListener(topics = "driver-status-topic", groupId = "notification-group")
//    public void consume(DriverStatusEvent event) {
//
//        // Optionally check if driver is online
//        boolean isOnline = sessionManager.isOnline(event.getDriverId());
//
//        // Broadcast (or target specific users)
//        messagingTemplate.convertAndSend(
//                "/topic/driver/status",
//                event
//        );
//    }
}
