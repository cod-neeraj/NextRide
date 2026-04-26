package com.example.NextRider_Driver.DTO.Request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LocationChangeRequest {
    private Double lon;
    private Double lat;
}
