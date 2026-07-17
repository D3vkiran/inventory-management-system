package com.inventory.backend.inventory;

import com.inventory.backend.exception.ResourceNotFoundException;
import com.inventory.backend.product.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
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

    private void apply(InventoryItem item, InventoryRequest request) {
        item.setProduct(productService.getEntity(request.productId()));
        item.setLocation(request.location().trim());
        item.setStatus(request.status());
        item.setQuantity(request.quantity());
    }
}
