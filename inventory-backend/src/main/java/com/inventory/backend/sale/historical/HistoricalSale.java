package com.inventory.backend.sale.historical;

import com.inventory.backend.common.BaseEntity;
import com.inventory.backend.product.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(
        name = "historical_sales",
        indexes = {
                @Index(name = "idx_historical_sales_product", columnList = "product_id"),
                @Index(name = "idx_historical_sales_asin", columnList = "asin"),
                @Index(name = "idx_historical_sales_sku", columnList = "sku"),
                @Index(name = "idx_historical_sales_date", columnList = "sale_date")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_historical_sales_source_row",
                        columnNames = {"source_file_name", "source_sheet", "source_row_number"}
                )
        }
)
public class HistoricalSale extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 255)
    private String sourceFileName;

    @Column(nullable = false, length = 80)
    private String sourceSheet;

    @Column(nullable = false)
    private Integer sourceRowNumber;

    @Column(nullable = false)
    private LocalDate saleDate;

    @Column(nullable = false, length = 255)
    private String productName;

    @Column(nullable = false, length = 120)
    private String sku;

    @Column(length = 20)
    private String asin;

    @Column
    private Integer fixedQuantity;

    @Column(nullable = false)
    private Integer soldQuantity;

    @Column(precision = 12, scale = 2)
    private BigDecimal unitCost;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal averageSellingPrice;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal revenue;

    @Column(precision = 12, scale = 2)
    private BigDecimal fbaFees;

    @Column(precision = 12, scale = 2)
    private BigDecimal salesTax;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalCost;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalInvestment;

    @Column(precision = 12, scale = 2)
    private BigDecimal profit;

    @Column(nullable = false, length = 160)
    private String importedBy;

    @Column(nullable = false)
    private Instant importedAt;
}
