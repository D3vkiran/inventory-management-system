package com.inventory.backend.inventory;

import com.inventory.backend.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ApiResponse<List<InventoryResponse>> findAll(@RequestParam(required = false) Long productId) {
        return ApiResponse.ok(inventoryService.findAll(productId));
    }

    @GetMapping("/{id}")
    public ApiResponse<InventoryResponse> findById(@PathVariable Long id) {
        return ApiResponse.ok(inventoryService.findById(id));
    }

    @GetMapping("/history")
    public ApiResponse<List<InventoryMovementResponse>> findHistory() {
        return ApiResponse.ok(inventoryService.findHistory());
    }

    @DeleteMapping("/history/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteHistory(@PathVariable Long id) {
        inventoryService.deleteHistory(id);
    }

    @PostMapping("/actions")
    public ApiResponse<InventoryOperationResponse> applyAction(
            @Valid @RequestBody InventoryActionRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication == null ? null : authentication.getName();
        return ApiResponse.ok(inventoryService.applyAction(request, userEmail), "Inventory action applied");
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<InventoryResponse> create(@Valid @RequestBody InventoryRequest request) {
        return ApiResponse.ok(inventoryService.create(request), "Inventory item created");
    }

    @PutMapping("/{id}")
    public ApiResponse<InventoryResponse> update(@PathVariable Long id, @Valid @RequestBody InventoryRequest request) {
        return ApiResponse.ok(inventoryService.update(id, request), "Inventory item updated");
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        inventoryService.delete(id);
    }
}
