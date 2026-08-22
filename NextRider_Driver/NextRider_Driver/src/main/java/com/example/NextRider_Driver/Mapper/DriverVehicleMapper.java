package com.example.NextRider_Driver.Mapper;

import com.example.NextRider_Driver.DTO.Request.VehicleRequest;
import com.example.NextRider_Driver.DTO.Response.DriverVehicleResponse;
import com.example.NextRider_Driver.Models.Entity.DriverVehicle;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface DriverVehicleMapper {

    DriverVehicle toEntity(VehicleRequest vehicleRequest);
    DriverVehicleResponse toResponse(DriverVehicle driverVehicle);
}
