package com.inventory.backend.product;

import com.inventory.backend.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(
        name = "products",
        indexes = {
                @Index(name = "idx_products_sku", columnList = "sku"),
                @Index(name = "idx_products_asin", columnList = "asin")
        }
)
public class Product extends BaseEntity {

    @Column(nullable = false, unique = true, length = 120)
    private String sku;

    @Column(length = 20)
    private String asin;

    @Column(length = 32)
    private String upc;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 120)
    private String brand;

    @Column(length = 120)
    private String category;

    @Column(length = 80)
    private String size;

    @Column(length = 80)
    private String color;

    @Column(length = 500)
    private String image;

    @Column(nullable = false)
    private Integer reorderPoint = 0;

    @Column(nullable = false)
    private Integer targetStock = 0;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal defaultCost = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal defaultPrice = BigDecimal.ZERO;
}
