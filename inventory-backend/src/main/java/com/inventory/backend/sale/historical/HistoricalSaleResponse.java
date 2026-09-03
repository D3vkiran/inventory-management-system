package com.inventory.backend.sale.historical;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record HistoricalSaleResponse(
        Long id,
        Long productId,
        String productName,
        String sku,
        String asin,
        LocalDate saleDate,
        Integer fixedQuantity,
        Integer soldQuantity,
        BigDecimal unitCost,
        BigDecimal averageSellingPrice,
        BigDecimal revenue,
        BigDecimal fbaFees,
        BigDecimal salesTax,
        BigDecimal totalCost,
        BigDecimal totalInvestment,
        BigDecimal profit,
        String sourceFileName,
        String sourceSheet,
        Integer sourceRowNumber,
        String importedBy,
        Instant importedAt
) {
    public static HistoricalSaleResponse from(HistoricalSale sale) {
        return new HistoricalSaleResponse(
                sale.getId(),
                sale.getProduct().getId(),
                sale.getProductName(),
                sale.getSku(),
                sale.getAsin(),
                sale.getSaleDate(),
                sale.getFixedQuantity(),
                sale.getSoldQuantity(),
                sale.getUnitCost(),
                sale.getAverageSellingPrice(),
                sale.getRevenue(),
                sale.getFbaFees(),
                sale.getSalesTax(),
                sale.getTotalCost(),
                sale.getTotalInvestment(),
                sale.getProfit(),
                sale.getSourceFileName(),
                sale.getSourceSheet(),
                sale.getSourceRowNumber(),
                sale.getImportedBy(),
                sale.getImportedAt()
        );
    }
}
