package com.example.NextRider_Driver.Kafka.Accept;


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