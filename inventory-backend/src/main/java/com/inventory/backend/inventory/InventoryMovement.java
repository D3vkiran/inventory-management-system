package com.inventory.backend.inventory;

import com.inventory.backend.common.BaseEntity;
import com.inventory.backend.product.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(
        name = "inventory_movements",
        indexes = {
                @Index(name = "idx_inventory_movement_product", columnList = "product_id"),
                @Index(name = "idx_inventory_movement_timestamp", columnList = "occurred_at")
        }
)
public class InventoryMovement extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 120)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private InventoryAction action;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer previousStock;

    @Column(nullable = false)
    private Integer newStock;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private InventoryRemovalReason reason;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, length = 160)
    private String userEmail;

    @Column(nullable = false)
    private Instant occurredAt;
}
