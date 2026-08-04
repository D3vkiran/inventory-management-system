package com.inventory.backend.inventory;

import java.math.BigDecimal;
import java.time.Instant;

public record InventoryMovementResponse(
        Long id,
        Long productId,
        String productName,
        String sku,
        InventoryAction action,
        Integer quantity,
        Integer previousStock,
        Integer newStock,
        InventoryRemovalReason reason,
        BigDecimal revenue,
        BigDecimal cost,
        BigDecimal profit,
        String notes,
        String user,
        Instant timestamp
) {
    public static InventoryMovementResponse from(InventoryMovement movement) {
        return new InventoryMovementResponse(
                movement.getId(),
                movement.getProduct().getId(),
                movement.getProduct().getName(),
                movement.getSku(),
                movement.getAction(),
                movement.getQuantity(),
                movement.getPreviousStock(),
                movement.getNewStock(),
                movement.getReason(),
                movement.getRevenue(),
                movement.getCost(),
                movement.getProfit(),
                movement.getNotes(),
                movement.getUserEmail(),
                movement.getOccurredAt()
        );
    }
}
