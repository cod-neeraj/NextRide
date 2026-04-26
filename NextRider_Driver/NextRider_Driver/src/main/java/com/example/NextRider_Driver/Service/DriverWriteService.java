package com.example.NextRider_Driver.Service;

import com.example.NextRider_Driver.DTO.Request.LocationChangeRequest;
import com.example.NextRider_Driver.DTO.Request.RegisterProfile;
import com.example.NextRider_Driver.DTO.Request.StatusChangeRequest;
import com.example.NextRider_Driver.DTO.Response.DriverLocationResponse;
import com.example.NextRider_Driver.DTO.Response.DriverProfileResponse;
import com.example.NextRider_Driver.Exception.LongLatNullException;
import com.example.NextRider_Driver.Exception.UserNotExistException;
import com.example.NextRider_Driver.Kafka.Accept.DriverRegisterEvent;
import com.example.NextRider_Driver.Mapper.DriverProfileMapper;
import com.example.NextRider_Driver.Models.Entity.DriverProfile;
import com.example.NextRider_Driver.Models.Enums.DriverStatus;
import com.example.NextRider_Driver.Repository.DriverProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.sql.Driver;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class DriverWriteService {

    private final DriverProfileRepository driverProfileRepository;
    private final DriverProfileMapper driverProfileMapper;
    private final RedisTemplate<String, Object> redisTemplate;    // for value ops
    private final RedisTemplate stringRedisTemplate;

    public void registerDriver(DriverRegisterEvent driverRegisterEvent){
        DriverProfile driverProfile = DriverProfile.builder()
                .userId(driverRegisterEvent.getUserId())
                .fullName(driverRegisterEvent.getFullName())
                .status(DriverStatus.OFFLINE)
                .build();

        driverProfileRepository.save(driverProfile);
    }
    public DriverProfileResponse registerProfileDriver(RegisterProfile registerProfile, UUID userId){
        DriverProfile driverProfile = driverProfileRepository.findByUserId(userId)
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

    public DriverLocationResponse statusChange(UUID userId, StatusChangeRequest statusChangeRequest){

        DriverProfile driverProfile = driverProfileRepository.findByUserId(userId)
                .orElseThrow(()-> new UserNotExistException("User not exist Please SignUp first"));
        if(driverProfile.getStatus() == DriverStatus.ON_RIDE) {
            throw new RuntimeException("Cannot change status during active ride");
        }
        if(statusChangeRequest.getStatus()==DriverStatus.AVAILABLE){
            if(statusChangeRequest.getLat() == null || statusChangeRequest.getLon() == null){
                throw new LongLatNullException("Long or Lat is empty");
            }
            driverProfile.setStatus(DriverStatus.AVAILABLE);
            driverProfile.setCurrentLat(statusChangeRequest.getLat());
            driverProfile.setCurrentLng(statusChangeRequest.getLon());
            driverProfileRepository.save(driverProfile);
            stringRedisTemplate.opsForGeo().add(
                    "drivers:geo",
                    new Point(statusChangeRequest.getLon(),
                            statusChangeRequest.getLat()),
                    userId
            );
            redisTemplate.opsForValue().set(
                    "driver:status:" + userId,
                    "AVAILABLE",
                    30, TimeUnit.SECONDS
            );
            redisTemplate.opsForValue().set(
                    "driver:location:" + userId,
                    statusChangeRequest.getLat() + "," + statusChangeRequest.getLon(),
                    30, TimeUnit.SECONDS
            );

        }else{
            driverProfile.setStatus(DriverStatus.OFFLINE);
            driverProfileRepository.save(driverProfile);
            stringRedisTemplate.opsForGeo().remove(
                    "drivers:geo",
                    userId
            );
            redisTemplate.delete("driver:status:" + userId);
            redisTemplate.delete("driver:location:" + userId);

        }

        return driverProfileMapper.toLocationResponse(driverProfile);
    }

    public void locationChange(UUID userId, LocationChangeRequest locationChangeRequest){
        String status = (String) redisTemplate.opsForValue()
                .get("driver:status:" + userId);
        if (status == null || status.equalsIgnoreCase("OFFLINE")) {
            throw new RuntimeException("Cannot update location while offline");
        }
        stringRedisTemplate.opsForGeo().add(
                "drivers:geo",
                new Point(locationChangeRequest.getLon(),
                        locationChangeRequest.getLat()),
                userId
        );
        redisTemplate.opsForValue().set(
                "driver:status:" + userId,
                status,
                30, TimeUnit.SECONDS
        );
        redisTemplate.opsForValue().set(
                "driver:location:" + userId,
                locationChangeRequest.getLat() + "," + locationChangeRequest.getLon(),
                30, TimeUnit.SECONDS
        );



    }



}
