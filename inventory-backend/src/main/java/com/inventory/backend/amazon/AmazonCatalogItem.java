package com.inventory.backend.amazon;

import java.math.BigDecimal;

record AmazonCatalogItem(
        String sku,
        String asin,
        String name,
        String brand,
        BigDecimal price
) {
}
