package com.inventory.backend.amazon;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AmazonSpApiClient {

    private static final int MAX_PAGES = 20;

    private final AmazonProperties properties;
    private final AmazonLwaClient lwaClient;
    private final AmazonSpApiSigner signer;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public List<AmazonCatalogItem> fetchProducts() {
        List<AmazonCatalogItem> items = new ArrayList<>();
        String nextToken = null;
        int pages = 0;
        do {
            Map<String, String> query = new LinkedHashMap<>();
            query.put("marketplaceIds", properties.marketplaceId());
            query.put("includedData", "summaries,attributes,offers");
            query.put("issueLocale", "en_US");
            if (nextToken != null) query.put("pageToken", nextToken);

            JsonNode root = get("/listings/2021-08-01/items/" + properties.sellerId(), query);
            root.path("items").forEach(item -> {
                String sku = item.path("sku").asText("");
                if (sku.isBlank()) return;
                JsonNode summary = first(item.path("summaries"));
                items.add(new AmazonCatalogItem(
                        sku,
                        summary.path("asin").asText(null),
                        firstText(summary, "itemName", sku),
                        firstText(summary, "brandName", null),
                        firstPrice(item.path("offers"))
                ));
            });
            nextToken = root.path("pagination").path("nextToken").asText(null);
            pages++;
        } while (nextToken != null && pages < MAX_PAGES);
        return items;
    }

    public List<AmazonInventorySummary> fetchInventory() {
        List<AmazonInventorySummary> summaries = new ArrayList<>();
        String nextToken = null;
        int pages = 0;
        do {
            Map<String, String> query = new LinkedHashMap<>();
            query.put("details", "true");
            query.put("granularityType", "Marketplace");
            query.put("granularityId", properties.marketplaceId());
            query.put("marketplaceIds", properties.marketplaceId());
            if (nextToken != null) query.put("nextToken", nextToken);

            JsonNode root = get("/fba/inventory/v1/summaries", query);
            root.path("payload").path("inventorySummaries").forEach(item -> {
                String sku = item.path("sellerSku").asText("");
                if (sku.isBlank()) return;
                summaries.add(new AmazonInventorySummary(
                        sku,
                        item.path("asin").asText(null),
                        item.path("productName").asText(sku),
                        item.path("totalQuantity").asInt(0)
                ));
            });
            nextToken = root.path("pagination").path("nextToken").asText(null);
            pages++;
        } while (nextToken != null && pages < MAX_PAGES);
        return summaries;
    }

    private JsonNode get(String path, Map<String, String> query) {
        String accessToken = lwaClient.accessToken();
        URI baseUri = URI.create(properties.endpoint() + path);
        SignedAmazonRequest signed = signer.sign(properties, "GET", baseUri, query, accessToken);

        HttpRequest.Builder builder = HttpRequest.newBuilder(signed.uri()).GET();
        signed.headers().forEach(builder::header);

        try {
            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                throw new AmazonApiException("Amazon SP-API request failed with status " + response.statusCode());
            }
            return objectMapper.readTree(response.body());
        } catch (IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) Thread.currentThread().interrupt();
            throw new AmazonApiException("Amazon SP-API request failed", ex);
        }
    }

    private JsonNode first(JsonNode node) {
        return node.isArray() && !node.isEmpty() ? node.get(0) : objectMapper.createObjectNode();
    }

    private String firstText(JsonNode node, String field, String fallback) {
        String value = node.path(field).asText(null);
        return value == null || value.isBlank() ? fallback : value;
    }

    private BigDecimal firstPrice(JsonNode offers) {
        JsonNode offer = first(offers);
        JsonNode amount = offer.path("price").path("amount");
        return amount.isNumber() ? amount.decimalValue() : null;
    }
}
