package com.example.NextRide_User.Configuration;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic registerDriver(){
        return TopicBuilder
                .name("driver.registered")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
