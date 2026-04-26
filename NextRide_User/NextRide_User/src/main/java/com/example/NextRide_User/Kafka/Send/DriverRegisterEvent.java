package com.example.NextRide_User.Kafka.Send;


import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverRegisterEvent {
    private UUID userId;
    private String fullName;
    private String email;
    private String phone;
    private String passwordHash;
    private Instant registeredAt;
}