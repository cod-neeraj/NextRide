package com.example.NextRide_Ride.Service;

import com.example.NextRide_Ride.Configuration.RestTemplateConfig;
import com.example.NextRide_Ride.Configuration.WebClientConfig;
import com.example.NextRide_Ride.DTO.Response.NearbyDriverResponse;
import com.example.NextRide_Ride.Models.Entity.Ride;
import com.example.NextRide_Ride.Models.Enums.RideStatus;
import com.example.NextRide_Ride.Repository.RideRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatusCode;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.concurrent.TimeUnit;
@Service
@RequiredArgsConstructor
@Slf4j
public class RideMatchingScheduler {

    private final RideRepository rideRepository;
    private final WebClient webClient;
    private final RedisTemplate redisTemplate;

    @Scheduled(fixedDelay = 5000)
    public void matchRide() {
        List<Ride> pendingRides = rideRepository.findByStatus(RideStatus.REQUESTED);

        if (pendingRides.isEmpty()) {
            log.info("No pending rides in this batch");
            return;
        }

        log.info("Batch started — {} pending rides", pendingRides.size());
        Map<UUID, List<NearbyDriverResponse>> rideToDrivers = new HashMap<>();

        for (Ride ride : pendingRides) {
            try {
                System.out.println("❤️❤️");
                NearbyDriverResponse[] drivers = webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/api/rider/ride/internal/drivers/nearby")
                                .queryParam("lat", ride.getPickupLat())
                                .queryParam("lng", ride.getPickupLng())
                                .queryParam("radiusKm", 5)
                                .build())
                        .retrieve()

                        .onStatus(HttpStatusCode::is4xxClientError, response -> {
                            log.warn("Driver service 4xx for ride {}", ride.getId());
                            return Mono.error(new RuntimeException("Driver service client error"));
                        })

                        .onStatus(HttpStatusCode::is5xxServerError, response -> {
                            log.error("Driver service 5xx for ride {}", ride.getId());
                            return Mono.error(new RuntimeException("Driver service is down"));
                        })

                        .bodyToMono(NearbyDriverResponse[].class)
                        .block();

                if (drivers != null && drivers.length > 0) {
                    rideToDrivers.put(ride.getId(), Arrays.asList(drivers));
                    log.info("Ride {} → {} drivers found", ride.getId(), drivers.length);
                } else {
                    log.info("Ride {} → no drivers nearby", ride.getId());
                }

            } catch (Exception e) {
                log.error("Failed to fetch drivers for ride {}: {}", ride.getId(), e.getMessage());
            }
        }


        if (rideToDrivers.isEmpty()) {
            log.info("No drivers available for any ride in this batch");
            return;
        }

        for (Ride ride : pendingRides) {
            List<NearbyDriverResponse> drivers = rideToDrivers.get(ride.getId());
            if (drivers == null || drivers.isEmpty()) continue;

            List<NearbyDriverResponse> ranked = drivers.stream()
                    .sorted(Comparator.comparingDouble(
                            d -> -calculateScore(d.getDistanceKm(), d.getRating())
                    ))
                    .toList();

            NearbyDriverResponse best = ranked.get(0);

            ride.setDriverId(best.getDriverId());
            ride.setStatus(RideStatus.DRIVER_NOTIFIED);
            rideRepository.save(ride);

            if (ranked.size() > 1) {
                List<String> backups = ranked.subList(1, ranked.size())
                        .stream()
                        .map(d -> d.getDriverId().toString())
                        .toList();

                redisTemplate.opsForList().rightPushAll("ride:backups:" + ride.getId(), backups);
                redisTemplate.expire("ride:backups:" + ride.getId(), 2, TimeUnit.MINUTES);
            }

            log.info("Ride {} → assigned to Driver {}", ride.getId(), best.getDriverId());
        }
    }

    private double calculateScore(double distanceKm, double rating) {
        double distanceScore = (distanceKm > 0) ? (1.0 / distanceKm) * 0.6 : 0.6;
        double ratingScore = (rating / 5.0) * 0.4;
        return distanceScore + ratingScore;
    }
}