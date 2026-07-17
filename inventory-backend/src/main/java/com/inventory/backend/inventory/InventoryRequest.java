package com.inventory.backend.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InventoryRequest(
        @NotNull Long productId,
        @NotBlank @Size(max = 120) String location,
        @NotNull InventoryStatus status,
        @NotNull @Min(0) Integer quantity
) {
}
