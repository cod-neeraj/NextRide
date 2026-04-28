package com.example.NextRider_Driver.Controller;


import com.example.NextRider_Driver.DTO.Request.NearbyDriverResponse;
import com.example.NextRider_Driver.Models.Entity.DriverProfile;
import com.example.NextRider_Driver.Repository.DriverProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.Circle;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.domain.geo.Metrics;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.sound.midi.Soundbank;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/rider/ride")
@RequiredArgsConstructor
@Slf4j
public class RideController {

    private final StringRedisTemplate stringRedisTemplate;
    private final DriverProfileRepository driverProfileRepository;



    @GetMapping("/internal/drivers/nearby")
    public ResponseEntity<List<NearbyDriverResponse>> getNearbyDrivers(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam Double radiusKm) {

        log.info("GEO SEARCH → lng: {}, lat: {}, radius: {}", lng, lat, radiusKm);
        GeoResults<RedisGeoCommands.GeoLocation<String>> results =
                stringRedisTemplate.opsForGeo().radius(
                        "drivers:geo",
                        new Circle(
                                new Point(lng, lat),
                                new Distance(radiusKm, Metrics.KILOMETERS)
                        ),
                        RedisGeoCommands.GeoRadiusCommandArgs
                                .newGeoRadiusArgs()
                                .includeDistance()
                                .sortAscending()
                                .limit(10)
                );

        if (results == null) return ResponseEntity.ok(List.of());

        List<NearbyDriverResponse> response = results.getContent()
                .stream()
                .map(result -> {
                    UUID driverId = UUID.fromString(
                            result.getContent().getName()
                    );
                    double distance = result.getDistance().getValue();

                    Double ratings = driverProfileRepository
                            .findRatings(driverId);
                    String value = stringRedisTemplate.opsForValue()
                            .get("driver:location:" + driverId);

                    String[] parts = value.split(",");

                    double lat1 = Double.parseDouble(parts[0]);
                    double lon1 = Double.parseDouble(parts[1]);

                    return NearbyDriverResponse.builder()
                            .driverId(driverId)
                            .distanceKm(distance)
                            .rating(ratings)
                            .lat(lat1)
                            .lng(lon1)
                            .build();
                })
                .filter(Objects::nonNull)
                .toList();

        return ResponseEntity.ok(response);
    }
}
