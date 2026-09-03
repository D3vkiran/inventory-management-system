package com.inventory.backend.sale.historical;

import java.util.List;

public record HistoricalSalesImportResult(
        String sourceFileName,
        String sourceSheet,
        Integer totalRows,
        Integer importedRecords,
        Integer rejectedRecords,
        Integer batchSize,
        List<HistoricalSaleRejectedRecord> rejections
) {
}
