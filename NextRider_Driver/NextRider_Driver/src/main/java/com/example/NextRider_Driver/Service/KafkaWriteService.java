package com.example.NextRider_Driver.Service;

import com.example.NextRider_Driver.Kafka.Accept.DriverRegisterEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaWriteService {

    private final DriverWriteService driverWriteService;

    @KafkaListener(topics = "driver.registered",groupId = "next_ride3")
    public void registerDriver(DriverRegisterEvent driverRegisterEvent){
        System.out.println("👍👍");
       driverWriteService.registerDriver(driverRegisterEvent);
    }

}
