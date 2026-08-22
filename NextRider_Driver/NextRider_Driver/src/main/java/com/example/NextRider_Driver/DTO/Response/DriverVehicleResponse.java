package com.example.NextRider_Driver.DTO.Response;

import com.example.NextRider_Driver.Models.Enums.FuelType;
import com.example.NextRider_Driver.Models.Enums.VehicleType;
import com.example.NextRider_Driver.Models.Enums.VerificationStatus;
import jakarta.persistence.Column;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DriverVehicleResponse {
    private VehicleType vehicleType;
    private String brand;
    private String model;
    private String color;
    private String registrationNumber;
    private String registrationState;
    private Integer manufactureYear;
    private FuelType fuelType;
    private VerificationStatus status;
}
