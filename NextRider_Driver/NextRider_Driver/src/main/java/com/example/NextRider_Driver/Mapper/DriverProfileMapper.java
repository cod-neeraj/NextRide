package com.example.NextRider_Driver.Mapper;

import com.example.NextRider_Driver.DTO.Response.DriverProfileResponse;
import com.example.NextRider_Driver.Models.Entity.DriverProfile;

import java.sql.Driver;

@Mapper(componentModel = "spring")
public interface DriverProfileMapper {
    DriverProfileResponse toResponse(DriverProfile driverProfile);
}
