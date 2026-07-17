package com.inventory.backend.product;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(
        Long id,
        String sku,
        String asin,
        String upc,
        String name,
        String brand,
        String category,
        String size,
        String color,
        String image,
        Integer reorderPoint,
        Integer targetStock,
        BigDecimal defaultCost,
        BigDecimal defaultPrice,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getAsin(),
                product.getUpc(),
                product.getName(),
                product.getBrand(),
                product.getCategory(),
                product.getSize(),
                product.getColor(),
                product.getImage(),
                product.getReorderPoint(),
                product.getTargetStock(),
                product.getDefaultCost(),
                product.getDefaultPrice(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
