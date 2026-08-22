package com.example.NextRider_Driver.Mapper;

import com.example.NextRider_Driver.DTO.Response.DriverLocationResponse;
import com.example.NextRider_Driver.DTO.Response.DriverProfileResponse;
import com.example.NextRider_Driver.Models.Entity.DriverProfile;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface DriverProfileMapper {
    DriverProfileResponse toResponse(DriverProfile driverProfile);
    DriverLocationResponse toLocationResponse(DriverProfile driverProfile);
}
