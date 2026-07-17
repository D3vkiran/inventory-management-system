package com.inventory.backend;

import com.inventory.backend.config.AppProperties;
import com.inventory.backend.amazon.AmazonProperties;
import com.inventory.backend.security.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
@EnableConfigurationProperties({AppProperties.class, JwtProperties.class, AmazonProperties.class})
public class InventoryBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(InventoryBackendApplication.class, args);
    }
}
