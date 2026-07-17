package com.inventory.backend.inventory;

import java.time.Instant;

public record InventoryResponse(
        Long id,
        Long productId,
        String sku,
        String productName,
        String location,
        InventoryStatus status,
        Integer quantity,
        Instant createdAt,
        Instant updatedAt
) {
    public static InventoryResponse from(InventoryItem item) {
        return new InventoryResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getSku(),
                item.getProduct().getName(),
                item.getLocation(),
                item.getStatus(),
                item.getQuantity(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
