package com.inventory.backend.amazon;

import com.inventory.backend.inventory.InventoryItem;
import com.inventory.backend.inventory.InventoryRepository;
import com.inventory.backend.inventory.InventoryStatus;
import com.inventory.backend.product.Product;
import com.inventory.backend.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AmazonSyncService {

    private static final String AMAZON_FBA_LOCATION = "Amazon FBA";

    private final AmazonProperties properties;
    private final AmazonSpApiClient amazonSpApiClient;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    public AmazonStatusResponse status() {
        return new AmazonStatusResponse(
                properties.configured(),
                properties.endpoint(),
                properties.region(),
                masked(properties.marketplaceId()),
                masked(properties.sellerId()),
                properties.configured() ? "Amazon SP-API configuration is present" : properties.missingConfigurationMessage()
        );
    }

    @Transactional
    public AmazonSyncResult syncProducts() {
        requireConfigured();
        List<AmazonCatalogItem> items = amazonSpApiClient.fetchProducts();
        int created = 0;
        int updated = 0;
        int skipped = 0;

        for (AmazonCatalogItem item : items) {
            if (blank(item.sku())) {
                skipped++;
                continue;
            }
            Product product = productRepository.findBySkuIgnoreCase(item.sku()).orElse(null);
            boolean isNew = product == null;
            if (isNew) {
                product = new Product();
                product.setSku(item.sku());
                product.setReorderPoint(0);
                product.setTargetStock(0);
                product.setDefaultCost(BigDecimal.ZERO);
                product.setDefaultPrice(BigDecimal.ZERO);
            }
            applyProduct(product, item);
            productRepository.save(product);
            if (isNew) created++;
            else updated++;
        }

        return new AmazonSyncResult(items.size(), created, updated, skipped, "Amazon products synced");
    }

    @Transactional
    public AmazonSyncResult syncInventory() {
        requireConfigured();
        List<AmazonInventorySummary> summaries = amazonSpApiClient.fetchInventory();
        int created = 0;
        int updated = 0;
        int skipped = 0;

        for (AmazonInventorySummary summary : summaries) {
            if (blank(summary.sku())) {
                skipped++;
                continue;
            }

            Product product = productRepository.findBySkuIgnoreCase(summary.sku()).orElseGet(() -> {
                Product createdProduct = new Product();
                createdProduct.setSku(summary.sku());
                createdProduct.setAsin(clean(summary.asin()));
                createdProduct.setName(blank(summary.productName()) ? summary.sku() : summary.productName());
                createdProduct.setReorderPoint(0);
                createdProduct.setTargetStock(0);
                createdProduct.setDefaultCost(BigDecimal.ZERO);
                createdProduct.setDefaultPrice(BigDecimal.ZERO);
                return productRepository.save(createdProduct);
            });

            if (!blank(summary.asin()) && blank(product.getAsin())) {
                product.setAsin(summary.asin());
            }
            if (!blank(summary.productName()) && (blank(product.getName()) || product.getName().equals(product.getSku()))) {
                product.setName(summary.productName());
            }
            productRepository.save(product);

            InventoryItem item = inventoryRepository
                    .findByProductIdAndLocationIgnoreCaseAndStatus(product.getId(), AMAZON_FBA_LOCATION, InventoryStatus.AVAILABLE)
                    .orElse(null);
            boolean isNew = item == null;
            if (isNew) {
                item = new InventoryItem();
                item.setProduct(product);
                item.setLocation(AMAZON_FBA_LOCATION);
                item.setStatus(InventoryStatus.AVAILABLE);
            }
            item.setQuantity(Math.max(0, summary.quantity()));
            inventoryRepository.save(item);
            if (isNew) created++;
            else updated++;
        }

        return new AmazonSyncResult(summaries.size(), created, updated, skipped, "Amazon inventory synced");
    }

    private void requireConfigured() {
        if (!properties.configured()) {
            throw new AmazonConfigurationException(properties.missingConfigurationMessage());
        }
    }

    private void applyProduct(Product product, AmazonCatalogItem item) {
        product.setAsin(clean(item.asin()));
        product.setName(blank(item.name()) ? item.sku() : item.name());
        if (!blank(item.brand())) product.setBrand(item.brand());
        if (item.price() != null) product.setDefaultPrice(item.price());
    }

    private String clean(String value) {
        return blank(value) ? null : value.trim();
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private String masked(String value) {
        if (blank(value)) return "";
        if (value.length() <= 4) return "****";
        return value.substring(0, 2) + "****" + value.substring(value.length() - 2);
    }
}
