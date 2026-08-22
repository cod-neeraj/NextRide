package com.example.NextRider_Driver.Service;

import com.example.NextRider_Driver.DTO.Request.VehicleRequest;
import com.example.NextRider_Driver.DTO.Response.DriverVehicleResponse;
import com.example.NextRider_Driver.Exception.UserNotExistException;
import com.example.NextRider_Driver.Mapper.DriverProfileMapper;
import com.example.NextRider_Driver.Mapper.DriverVehicleMapper;
import com.example.NextRider_Driver.Models.Entity.DriverProfile;
import com.example.NextRider_Driver.Models.Entity.DriverVehicle;
import com.example.NextRider_Driver.Repository.DriverProfileRepository;
import com.example.NextRider_Driver.Repository.DriverVehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DriverVehicleWriteService {
    private final DriverProfileRepository driverProfileRepository;
    private final DriverVehicleRepository driverVehicleRepository;
    private final DriverVehicleMapper driverVehicleMapper;


    public DriverVehicleResponse registerDriverVehicle(VehicleRequest vehicleRequest, UUID userId){
        DriverProfile driverProfile = driverProfileRepository.findByUserId(userId)
                .orElseThrow(()-> new UserNotExistException("DRIVER NOT EXIST PLEASE SIGNUP AGAIN"));
        DriverVehicle driverVehicle = driverVehicleMapper.toEntity(vehicleRequest);
        driverVehicle.setDriver(driverProfile);
        driverVehicleRepository.save(driverVehicle);
        DriverVehicleResponse driverVehicleResponse = driverVehicleMapper.toResponse(driverVehicle);
        return driverVehicleResponse;



    }
}
