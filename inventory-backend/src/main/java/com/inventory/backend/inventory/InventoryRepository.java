package com.inventory.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByProductId(Long productId);

    Optional<InventoryItem> findByProductIdAndLocationIgnoreCaseAndStatus(Long productId, String location, InventoryStatus status);

    @Modifying
    @Query("delete from InventoryItem item where item.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}
