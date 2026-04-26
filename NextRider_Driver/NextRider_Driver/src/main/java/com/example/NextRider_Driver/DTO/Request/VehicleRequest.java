package com.example.NextRider_Driver.DTO.Request;

import com.example.NextRider_Driver.Models.Entity.DriverProfile;
import com.example.NextRider_Driver.Models.Enums.FuelType;
import com.example.NextRider_Driver.Models.Enums.VehicleType;
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
public class VehicleRequest {
    @Column(nullable = false)
    private VehicleType vehicleType;
    @Column(nullable = false)
    private String brand;
    @Column(nullable = false)
    private String model;
    @Column(nullable = false)
    private String color;
    @Column(nullable = false)
    private String registrationNumber;
    @Column(nullable = false)
    private String registrationState;
    @Column(nullable = false)
    private Integer manufactureYear;
    @Column(nullable = false)
    private FuelType fuelType;

}