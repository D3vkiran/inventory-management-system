package com.inventory.backend.amazon;

public record AmazonStatusResponse(
        boolean configured,
        String endpoint,
        String region,
        String marketplaceId,
        String sellerId,
        String message
) {
}
