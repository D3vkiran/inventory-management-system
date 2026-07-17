package com.inventory.backend.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InventoryActionRequest(
        @NotNull Long productId,
        @NotBlank @Size(max = 120) String location,
        @NotNull InventoryAction action,
        @NotNull Integer quantity,
        InventoryRemovalReason reason,
        @Size(max = 1000) String notes
) {
}
