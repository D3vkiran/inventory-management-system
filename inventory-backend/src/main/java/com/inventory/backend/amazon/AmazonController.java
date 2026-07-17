package com.inventory.backend.amazon;

import com.inventory.backend.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/amazon")
@RequiredArgsConstructor
public class AmazonController {

    private final AmazonSyncService amazonSyncService;

    @GetMapping("/status")
    public ApiResponse<AmazonStatusResponse> status() {
        return ApiResponse.ok(amazonSyncService.status());
    }

    @PostMapping("/sync/products")
    public ApiResponse<AmazonSyncResult> syncProducts() {
        return ApiResponse.ok(amazonSyncService.syncProducts());
    }

    @PostMapping("/sync/inventory")
    public ApiResponse<AmazonSyncResult> syncInventory() {
        return ApiResponse.ok(amazonSyncService.syncInventory());
    }
}
