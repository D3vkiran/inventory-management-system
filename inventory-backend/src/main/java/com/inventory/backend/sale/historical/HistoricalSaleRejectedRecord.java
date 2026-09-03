package com.inventory.backend.sale.historical;

public record HistoricalSaleRejectedRecord(
        Integer rowNumber,
        String asin,
        String sku,
        String productName,
        String reason
) {
}
