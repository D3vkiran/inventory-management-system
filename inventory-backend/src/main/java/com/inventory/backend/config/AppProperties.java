package com.inventory.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Cors cors,
        Seed seed
) {
    public record Cors(List<String> allowedOrigins) {
    }

    public record Seed(String ownerEmail, String ownerPassword, String ownerName) {
    }
}
