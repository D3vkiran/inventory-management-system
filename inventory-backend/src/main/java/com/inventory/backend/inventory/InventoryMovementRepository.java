package com.inventory.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    List<InventoryMovement> findAllByOrderByOccurredAtDesc();

    @Modifying
    @Query("delete from InventoryMovement movement where movement.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
