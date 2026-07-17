package com.inventory.backend.purchase;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PurchaseResponse(
        Long id,
        Long productId,
        String sku,
        Long supplierId,
        String supplierName,
        LocalDate purchaseDate,
        Integer quantity,
        BigDecimal unitCost,
        String invoice,
        String location,
        String notes
) {
    public static PurchaseResponse from(Purchase purchase) {
        return new PurchaseResponse(
                purchase.getId(),
                purchase.getProduct().getId(),
                purchase.getProduct().getSku(),
                purchase.getSupplier() == null ? null : purchase.getSupplier().getId(),
                purchase.getSupplier() == null ? null : purchase.getSupplier().getName(),
                purchase.getPurchaseDate(),
                purchase.getQuantity(),
                purchase.getUnitCost(),
                purchase.getInvoice(),
                purchase.getLocation(),
                purchase.getNotes()
        );
    }
}
