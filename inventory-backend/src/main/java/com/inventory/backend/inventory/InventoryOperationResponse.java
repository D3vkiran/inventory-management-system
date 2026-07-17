package com.inventory.backend.inventory;

public record InventoryOperationResponse(
        InventoryResponse inventory,
        InventoryMovementResponse movement
) {
}
