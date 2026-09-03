package com.inventory.backend.sale.historical;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoricalSaleRepository extends JpaRepository<HistoricalSale, Long> {
    boolean existsBySourceFileNameIgnoreCaseAndSourceSheetIgnoreCaseAndSourceRowNumber(
            String sourceFileName,
            String sourceSheet,
            Integer sourceRowNumber
    );

    List<HistoricalSale> findAllByOrderBySaleDateDescIdDesc();
}
