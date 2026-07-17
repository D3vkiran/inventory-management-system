package com.inventory.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByProductId(Long productId);

    Optional<InventoryItem> findByProductIdAndLocationIgnoreCaseAndStatus(Long productId, String location, InventoryStatus status);
}
