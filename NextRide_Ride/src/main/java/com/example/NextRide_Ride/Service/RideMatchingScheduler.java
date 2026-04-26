package com.example.NextRide_Ride.Service;

import com.example.NextRide_Ride.Configuration.RestTemplateConfig;
import com.example.NextRide_Ride.DTO.Response.NearbyDriverResponse;
import com.example.NextRide_Ride.Models.Entity.Ride;
import com.example.NextRide_Ride.Models.Enums.RideStatus;
import com.example.NextRide_Ride.Repository.RideRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RideMatchingScheduler {

    private final RideRepository rideRepository;
    private final RestTemplateConfig restTemplate;
    private final RedisTemplate redisTemplate;
    private static final String DRIVER_SERVICE_URL =
            "http://localhost:9093/internal/drivers/nearby";

    @Scheduled(fixedDelay = 5000)
    public void matchRide(){
        List<Ride> pendingRides = rideRepository.findByStatus(RideStatus.REQUESTED);
        if(pendingRides.isEmpty()){
            log.info("No pending rides in this batch");
            return;
        }
        log.info("Batch started — {} pending rides", pendingRides.size());
        Map<UUID, List<NearbyDriverResponse>> rideToDrivers = new HashMap<>();

        for (Ride ride : pendingRides) {
            String url = DRIVER_SERVICE_URL
                    + "?lat=" + ride.getPickupLat()
                    + "&lng=" + ride.getPickupLng()
                    + "&radiusKm=5";

            try {
                NearbyDriverResponse[] drivers = restTemplate.getForObject(
                        url,
                        NearbyDriverResponse[].class
                );

                if (drivers != null && drivers.length > 0) {
                    rideToDrivers.put(ride.getId(), Arrays.asList(drivers));
                    log.info("Ride {} → {} drivers found",
                            ride.getId(), drivers.length);
                } else {
                    log.info("Ride {} → no drivers nearby", ride.getId());
                }

            } catch (Exception e) {
                log.error("Failed to fetch drivers for ride {}: {}",
                        ride.getId(), e.getMessage());
            }
        }


        if (rideToDrivers.isEmpty()) {
            log.info("No drivers available for any ride in this batch");
            return;
        }

        for (Ride ride : pendingRides) {
            List<NearbyDriverResponse> drivers =
                    rideToDrivers.get(ride.getId());

            if (drivers == null || drivers.isEmpty()) continue;

            List<NearbyDriverResponse> ranked = drivers.stream()
                    .sorted(Comparator.comparingDouble(
                            d -> -calculateScore(d.getDistanceKm(), d.getRating())
                    ))
                    .toList();

            // Best driver
            NearbyDriverResponse best = ranked.get(0);

            // Assign to ride
            ride.setDriverId(best.getDriverId());
            ride.setStatus(RideStatus.DRIVER_NOTIFIED);
            rideRepository.save(ride);

            // Store backups in Redis
            if (ranked.size() > 1) {
                List<String> backups = ranked.subList(1, ranked.size())
                        .stream()
                        .map(d -> d.getDriverId().toString())
                        .toList();

                redisTemplate.opsForList().rightPushAll(
                        "ride:backups:" + ride.getId(),
                        backups
                );
                redisTemplate.expire(
                        "ride:backups:" + ride.getId(),
                        2, TimeUnit.MINUTES
                );
            }

            log.info("Ride {} → assigned to Driver {}",
                    ride.getId(), best.getDriverId());
        }

    }

    private double calculateScore(double distanceKm, double rating) {
        double distanceScore = (distanceKm > 0)
                ? (1.0 / distanceKm) * 0.6
                : 0.6;
        double ratingScore = (rating / 5.0) * 0.4;
        return distanceScore + ratingScore;
    }
}
