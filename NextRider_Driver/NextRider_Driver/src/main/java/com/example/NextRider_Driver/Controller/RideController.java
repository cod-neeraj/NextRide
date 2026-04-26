package com.example.NextRider_Driver.Controller;

public class RideController {
    @GetMapping("/internal/drivers/nearby")
    public ResponseEntity<List<NearbyDriverResponse>> getNearbyDrivers(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam Double radiusKm) {

        // 1. Redis GEO radius search
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

        // 2. Build response with distance + rating from DB
        List<NearbyDriverResponse> response = results.getContent()
                .stream()
                .map(result -> {
                    UUID driverId = UUID.fromString(
                            result.getContent().getName()
                    );
                    double distance = result.getDistance().getValue();

                    // fetch rating from DB
                    DriverProfile profile = driverProfileRepository
                            .findByUserId(driverId.toString())
                            .orElse(null);

                    if (profile == null) return null;

                    return NearbyDriverResponse.builder()
                            .driverId(driverId)
                            .distanceKm(distance)
                            .rating(profile.getRating().doubleValue())
                            .lat(profile.getCurrentLat())
                            .lng(profile.getCurrentLng())
                            .build();
                })
                .filter(Objects::nonNull)
                .toList();

        return ResponseEntity.ok(response);
    }
}
