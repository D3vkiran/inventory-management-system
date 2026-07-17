package com.inventory.backend.shipment;

import com.inventory.backend.common.BaseEntity;
import com.inventory.backend.product.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "shipments")
public class Shipment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "from_location", length = 120)
    private String from;

    @Column(name = "to_location", length = 120)
    private String to;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ShipmentStatus status = ShipmentStatus.DRAFT;

    private LocalDate shipDate;

    private LocalDate receiveDate;

    @Column(length = 1000)
    private String notes;
}
