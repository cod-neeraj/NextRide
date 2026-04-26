package com.example.NextRider_Driver.Service;

import com.example.NextRider_Driver.DTO.Request.RegisterProfile;
import com.example.NextRider_Driver.DTO.Response.DriverProfileResponse;
import com.example.NextRider_Driver.Exception.UserNotExistException;
import com.example.NextRider_Driver.Kafka.Accept.DriverRegisterEvent;
import com.example.NextRider_Driver.Mapper.DriverProfileMapper;
import com.example.NextRider_Driver.Models.Entity.DriverProfile;
import com.example.NextRider_Driver.Models.Enums.DriverStatus;
import com.example.NextRider_Driver.Repository.DriverProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Driver;

@Service
@RequiredArgsConstructor
public class DriverWriteService {

    private final DriverProfileRepository driverProfileRepository;
    private final DriverProfileMapper driverProfileMapper;

    public void registerDriver(DriverRegisterEvent driverRegisterEvent){
        DriverProfile driverProfile = DriverProfile.builder()
                .id(driverRegisterEvent.getUserId())
                .fullName(driverRegisterEvent.getFullName())
                .email(driverRegisterEvent.getEmail())
                .phoneNumber(driverRegisterEvent.getPhone())
                .password(driverRegisterEvent.getPasswordHash())
                .status(DriverStatus.ACTIVE)
                .build();

        driverProfileRepository.save(driverProfile);
    }
    public DriverProfileResponse registerProfileDriver(RegisterProfile registerProfile, String phoneNumber){
        DriverProfile driverProfile = driverProfileRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(()-> new UserNotExistException("User not exist Please SignUp first"));

        driverProfile.setProfilePhotoUrl(registerProfile.getProfilePhotoUrl());
        driverProfile.setCurrentLat(registerProfile.getCurrentLat());
        driverProfile.setCurrentLng(registerProfile.getCurrentLng());
        driverProfile.setState(registerProfile.getState());
        driverProfile.setCity(registerProfile.getCity());
        driverProfile.setStreet(registerProfile.getStreet());

        driverProfileRepository.save(driverProfile);
        return driverProfileMapper.toResponse(driverProfile);
    }




}
