package com.example.NextRider_Driver.DTO.Response;

import com.example.NextRider_Driver.Models.Enums.DriverStatus;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DriverProfileResponse {

        private UUID id;

        private String fullName;
        private String phoneNumber;
        private String email;

        private String profilePhotoUrl;

        private Double currentLat;
        private Double currentLng;

        private String street;
        private String city;
        private String state;

}
