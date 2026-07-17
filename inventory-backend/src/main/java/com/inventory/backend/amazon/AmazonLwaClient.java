package com.inventory.backend.amazon;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Component
@RequiredArgsConstructor
public class AmazonLwaClient {

    private static final URI TOKEN_URI = URI.create("https://api.amazon.com/auth/o2/token");

    private final AmazonProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private String cachedToken;
    private Instant expiresAt = Instant.EPOCH;

    public synchronized String accessToken() {
        if (cachedToken != null && Instant.now().isBefore(expiresAt.minusSeconds(60))) {
            return cachedToken;
        }

        String body = form("grant_type", "refresh_token")
                + "&" + form("refresh_token", properties.lwaRefreshToken())
                + "&" + form("client_id", properties.lwaClientId())
                + "&" + form("client_secret", properties.lwaClientSecret());

        HttpRequest request = HttpRequest.newBuilder(TOKEN_URI)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                throw new AmazonApiException("Amazon LWA token request failed with status " + response.statusCode());
            }
            var json = objectMapper.readTree(response.body());
            cachedToken = json.path("access_token").asText(null);
            long expiresIn = json.path("expires_in").asLong(3600);
            if (cachedToken == null || cachedToken.isBlank()) {
                throw new AmazonApiException("Amazon LWA token response did not include an access token");
            }
            expiresAt = Instant.now().plusSeconds(expiresIn);
            return cachedToken;
        } catch (IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) Thread.currentThread().interrupt();
            throw new AmazonApiException("Amazon LWA token request failed", ex);
        }
    }

    private String form(String key, String value) {
        return URLEncoder.encode(key, StandardCharsets.UTF_8) + "="
                + URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }
}
