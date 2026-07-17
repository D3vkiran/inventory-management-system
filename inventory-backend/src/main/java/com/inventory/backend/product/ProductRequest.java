package com.inventory.backend.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank @Size(max = 120) String sku,
        @Size(max = 20) String asin,
        @Size(max = 32) String upc,
        @NotBlank @Size(max = 255) String name,
        @Size(max = 120) String brand,
        @Size(max = 120) String category,
        @Size(max = 80) String size,
        @Size(max = 80) String color,
        @Size(max = 500) String image,
        @Min(0) Integer reorderPoint,
        @Min(0) Integer targetStock,
        @DecimalMin("0.00") BigDecimal defaultCost,
        @DecimalMin("0.00") BigDecimal defaultPrice
) {
}
