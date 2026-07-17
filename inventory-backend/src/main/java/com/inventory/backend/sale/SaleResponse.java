package com.inventory.backend.sale;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SaleResponse(
        Long id,
        Long productId,
        String sku,
        LocalDate saleDate,
        String marketplace,
        String orderId,
        Integer quantity,
        BigDecimal salePrice,
        BigDecimal fees,
        String sourceLocation,
        String notes
) {
    public static SaleResponse from(Sale sale) {
        return new SaleResponse(
                sale.getId(),
                sale.getProduct().getId(),
                sale.getProduct().getSku(),
                sale.getSaleDate(),
                sale.getMarketplace(),
                sale.getOrderId(),
                sale.getQuantity(),
                sale.getSalePrice(),
                sale.getFees(),
                sale.getSourceLocation(),
                sale.getNotes()
        );
    }
}
