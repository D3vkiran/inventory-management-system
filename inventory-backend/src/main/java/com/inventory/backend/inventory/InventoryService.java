package com.inventory.backend.inventory;

import com.inventory.backend.exception.ResourceNotFoundException;
import com.inventory.backend.product.Product;
import com.inventory.backend.product.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public List<InventoryResponse> findAll(Long productId) {
        List<InventoryItem> items = productId == null
                ? inventoryRepository.findAll()
                : inventoryRepository.findByProductId(productId);
        return items.stream().map(InventoryResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public InventoryItem getEntity(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));
    }

    @Transactional(readOnly = true)
    public InventoryResponse findById(Long id) {
        return InventoryResponse.from(getEntity(id));
    }

    @Transactional(readOnly = true)
    public List<InventoryMovementResponse> findHistory() {
        return inventoryMovementRepository.findAllByOrderByOccurredAtDesc()
                .stream()
                .map(InventoryMovementResponse::from)
                .toList();
    }

    @Transactional
    public InventoryResponse create(InventoryRequest request) {
        InventoryItem item = new InventoryItem();
        apply(item, request);
        return InventoryResponse.from(inventoryRepository.save(item));
    }

    @Transactional
    public InventoryResponse update(Long id, InventoryRequest request) {
        InventoryItem item = getEntity(id);
        apply(item, request);
        return InventoryResponse.from(inventoryRepository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        inventoryRepository.delete(getEntity(id));
    }

    @Transactional
    public void deleteHistory(Long id) {
        InventoryMovement movement = inventoryMovementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory history record not found"));
        inventoryMovementRepository.delete(movement);
    }

    @Transactional
    public InventoryOperationResponse applyAction(InventoryActionRequest request, String userEmail) {
        Product product = productService.getEntity(request.productId());
        String location = request.location().trim();
        int delta = calculateDelta(request);

        InventoryItem item = inventoryRepository
                .findByProductIdAndLocationIgnoreCaseAndStatus(product.getId(), location, InventoryStatus.AVAILABLE)
                .orElseGet(() -> {
                    InventoryItem created = new InventoryItem();
                    created.setProduct(product);
                    created.setLocation(location);
                    created.setStatus(InventoryStatus.AVAILABLE);
                    created.setQuantity(0);
                    return created;
                });

        int previousStock = item.getQuantity();
        if (request.action().resetsStock()) {
            delta = -previousStock;
        }
        int newStock = previousStock + delta;
        if (newStock < 0) {
            throw new IllegalArgumentException("Inventory action rejected: quantity exceeds available stock. Available stock is " + previousStock + ".");
        }

        InventoryRemovalReason movementReason = resolveReason(request);
        if (request.action().requiresReason() && movementReason == null) {
            throw new IllegalArgumentException("Reason is required for this inventory action.");
        }

        item.setQuantity(newStock);
        InventoryItem savedItem = inventoryRepository.save(item);

        InventoryMovement movement = new InventoryMovement();
        movement.setProduct(product);
        movement.setSku(product.getSku());
        movement.setAction(request.action());
        movement.setQuantity(delta);
        movement.setPreviousStock(previousStock);
        movement.setNewStock(newStock);
        movement.setReason(movementReason);
        movement.setNotes(cleanText(request.notes()));
        applySaleFinancials(movement, product, delta);
        movement.setUserEmail(cleanUser(userEmail));
        movement.setOccurredAt(Instant.now());
        InventoryMovement savedMovement = inventoryMovementRepository.save(movement);

        return new InventoryOperationResponse(
                InventoryResponse.from(savedItem),
                InventoryMovementResponse.from(savedMovement)
        );
    }

    private void apply(InventoryItem item, InventoryRequest request) {
        item.setProduct(productService.getEntity(request.productId()));
        item.setLocation(request.location().trim());
        item.setStatus(request.status());
        item.setQuantity(request.quantity());
    }

    private int calculateDelta(InventoryActionRequest request) {
        int quantity = request.quantity();
        if (request.action().resetsStock()) {
            return 0;
        }
        if (quantity == 0) {
            throw new IllegalArgumentException("Quantity must not be zero.");
        }

        if (request.action().increasesStock()) {
            return Math.abs(quantity);
        }
        if (request.action().decreasesStock()) {
            return -Math.abs(quantity);
        }
        return quantity;
    }

    private InventoryRemovalReason resolveReason(InventoryActionRequest request) {
        if (request.action() == InventoryAction.SOLD) {
            return InventoryRemovalReason.SALE;
        }
        return request.reason();
    }

    private void applySaleFinancials(InventoryMovement movement, Product product, int delta) {
        if (movement.getAction() != InventoryAction.SOLD) {
            return;
        }
        BigDecimal quantity = BigDecimal.valueOf(Math.abs(delta));
        BigDecimal revenue = product.getDefaultPrice().multiply(quantity);
        BigDecimal cost = product.getDefaultCost().multiply(quantity);
        movement.setRevenue(revenue);
        movement.setCost(cost);
        movement.setProfit(revenue.subtract(cost));
    }

    private String cleanText(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        return text.trim();
    }

    private String cleanUser(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return "system";
        }
        return userEmail.trim();
    }
}
