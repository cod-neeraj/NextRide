package com.example.NextRider_Driver.DTO.Response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashBoardMainResponse {

    private Long todayTotalRides;
    private Double todayEarnings;
    private Double averageRatings;
    private List<DriverRideResponse> driverRideResponseList;

}
