package com.inventory.backend.sale.historical;

import com.inventory.backend.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/sales/historical")
@RequiredArgsConstructor
public class HistoricalSaleController {

    private final HistoricalSalesImportService historicalSalesImportService;

    @GetMapping
    public ApiResponse<List<HistoricalSaleResponse>> findAll() {
        return ApiResponse.ok(historicalSalesImportService.findAll());
    }

    @PostMapping("/import")
    public ApiResponse<HistoricalSalesImportResult> importProfitsSheet(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "100") int batchSize,
            Authentication authentication
    ) {
        String importedBy = authentication == null ? null : authentication.getName();
        return ApiResponse.ok(
                historicalSalesImportService.importProfitsSheet(file, batchSize, importedBy),
                "Historical sales import completed"
        );
    }
}
