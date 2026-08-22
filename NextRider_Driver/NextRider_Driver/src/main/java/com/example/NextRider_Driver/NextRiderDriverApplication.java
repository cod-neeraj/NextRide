package com.example.NextRider_Driver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
@EnableFeignClients
public class NextRiderDriverApplication {

	public static void main(String[] args) {
		SpringApplication.run(NextRiderDriverApplication.class, args);
	}

}
