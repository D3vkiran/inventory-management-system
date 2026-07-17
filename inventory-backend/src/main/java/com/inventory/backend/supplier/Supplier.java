package com.inventory.backend.supplier;

import com.inventory.backend.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "suppliers")
public class Supplier extends BaseEntity {

    @Column(nullable = false, length = 160)
    private String name;

    @Column(length = 120)
    private String contact;

    @Column(length = 180)
    private String email;

    @Column(length = 40)
    private String phone;

    @Column(nullable = false)
    private Integer rating = 3;

    @Column(length = 1000)
    private String notes;
}
