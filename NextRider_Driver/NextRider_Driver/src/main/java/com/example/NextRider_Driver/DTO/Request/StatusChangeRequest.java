package com.example.NextRider_Driver.DTO.Request;

import com.example.NextRider_Driver.Models.Enums.DriverStatus;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StatusChangeRequest {
    private DriverStatus status;
    private Double lon;
    private Double lat;
}
