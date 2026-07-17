package com.inventory.backend.amazon;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "amazon.sp-api")
public record AmazonProperties(
        String endpoint,
        String region,
        String marketplaceId,
        String sellerId,
        String lwaClientId,
        String lwaClientSecret,
        String lwaRefreshToken,
        String awsAccessKeyId,
        String awsSecretAccessKey,
        String awsSessionToken
) {
    public boolean configured() {
        return present(endpoint)
                && present(region)
                && present(marketplaceId)
                && present(sellerId)
                && present(lwaClientId)
                && present(lwaClientSecret)
                && present(lwaRefreshToken)
                && present(awsAccessKeyId)
                && present(awsSecretAccessKey);
    }

    public String missingConfigurationMessage() {
        StringBuilder missing = new StringBuilder();
        appendMissing(missing, "AMAZON_SP_API_ENDPOINT", endpoint);
        appendMissing(missing, "AMAZON_SP_API_REGION", region);
        appendMissing(missing, "AMAZON_MARKETPLACE_ID", marketplaceId);
        appendMissing(missing, "AMAZON_SELLER_ID", sellerId);
        appendMissing(missing, "AMAZON_LWA_CLIENT_ID", lwaClientId);
        appendMissing(missing, "AMAZON_LWA_CLIENT_SECRET", lwaClientSecret);
        appendMissing(missing, "AMAZON_LWA_REFRESH_TOKEN", lwaRefreshToken);
        appendMissing(missing, "AMAZON_AWS_ACCESS_KEY_ID or AWS_ACCESS_KEY_ID", awsAccessKeyId);
        appendMissing(missing, "AMAZON_AWS_SECRET_ACCESS_KEY or AWS_SECRET_ACCESS_KEY", awsSecretAccessKey);
        return missing.isEmpty() ? "" : "Missing Amazon SP-API configuration: " + missing;
    }

    private static void appendMissing(StringBuilder target, String name, String value) {
        if (!present(value)) {
            if (!target.isEmpty()) target.append(", ");
            target.append(name);
        }
    }

    private static boolean present(String value) {
        return value != null && !value.isBlank();
    }
}
