package com.inventory.backend.product;

import com.inventory.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> findAll() {
        return productRepository.findAll().stream().map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Product getEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return ProductResponse.from(getEntity(id));
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsBySkuIgnoreCase(request.sku())) {
            throw new IllegalArgumentException("SKU already exists");
        }
        Product product = new Product();
        apply(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getEntity(id);
        productRepository.findBySkuIgnoreCase(request.sku())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("SKU already exists");
                });
        apply(product, request);
        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = getEntity(id);
        productRepository.delete(product);
    }

    private void apply(Product product, ProductRequest request) {
        product.setSku(request.sku().trim());
        product.setAsin(blankToNull(request.asin()));
        product.setUpc(blankToNull(request.upc()));
        product.setName(request.name().trim());
        product.setBrand(blankToNull(request.brand()));
        product.setCategory(blankToNull(request.category()));
        product.setSize(blankToNull(request.size()));
        product.setColor(blankToNull(request.color()));
        product.setImage(blankToNull(request.image()));
        product.setReorderPoint(defaultInt(request.reorderPoint()));
        product.setTargetStock(defaultInt(request.targetStock()));
        product.setDefaultCost(defaultMoney(request.defaultCost()));
        product.setDefaultPrice(defaultMoney(request.defaultPrice()));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private Integer defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
