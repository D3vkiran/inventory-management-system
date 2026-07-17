package com.inventory.backend.amazon;

record AmazonInventorySummary(
        String sku,
        String asin,
        String productName,
        int quantity
) {
}
