package com.example.NextRide_Ride;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NextRideRideApplication {

	public static void main(String[] args) {
		SpringApplication.run(NextRideRideApplication.class, args);
	}

}
