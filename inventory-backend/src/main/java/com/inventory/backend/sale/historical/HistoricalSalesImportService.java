package com.inventory.backend.sale.historical;

import com.inventory.backend.product.Product;
import com.inventory.backend.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HistoricalSalesImportService {

    private static final String PROFITS_SHEET = "PROFITS";
    private static final int MAX_HEADER_SCAN_ROWS = 50;

    private final HistoricalSaleRepository historicalSaleRepository;
    private final ProductRepository productRepository;

    public HistoricalSalesImportResult importProfitsSheet(MultipartFile file, int requestedBatchSize, String importedBy) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload a workbook that contains a PROFITS sheet.");
        }
        int batchSize = Math.max(1, Math.min(requestedBatchSize, 1000));
        String sourceFileName = cleanFileName(file.getOriginalFilename());
        List<HistoricalSaleRejectedRecord> rejections = new ArrayList<>();
        int totalRows = 0;
        int imported = 0;

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheet(PROFITS_SHEET);
            if (sheet == null) {
                throw new IllegalArgumentException("Workbook must contain a PROFITS sheet.");
            }

            HeaderRow headerRow = findHeaderRow(sheet);
            List<HistoricalSale> batch = new ArrayList<>(batchSize);

            for (int rowIndex = headerRow.rowNumber(); rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (isBlank(row)) {
                    continue;
                }
                totalRows++;
                ParseResult parsed = parseRow(row, headerRow.columns(), sourceFileName, cleanUser(importedBy));
                if (parsed.rejection() != null) {
                    rejections.add(parsed.rejection());
                    continue;
                }

                batch.add(parsed.sale());
                if (batch.size() >= batchSize) {
                    historicalSaleRepository.saveAll(batch);
                    imported += batch.size();
                    batch.clear();
                }
            }

            if (!batch.isEmpty()) {
                historicalSaleRepository.saveAll(batch);
                imported += batch.size();
            }
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to read the uploaded workbook.");
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to import historical sales: " + ex.getMessage());
        }

        return new HistoricalSalesImportResult(
                sourceFileName,
                PROFITS_SHEET,
                totalRows,
                imported,
                rejections.size(),
                batchSize,
                rejections
        );
    }

    public List<HistoricalSaleResponse> findAll() {
        return historicalSaleRepository.findAllByOrderBySaleDateDescIdDesc()
                .stream()
                .map(HistoricalSaleResponse::from)
                .toList();
    }

    private HeaderRow findHeaderRow(Sheet sheet) {
        int lastRowToScan = Math.min(sheet.getLastRowNum(), MAX_HEADER_SCAN_ROWS);
        for (int rowIndex = 0; rowIndex <= lastRowToScan; rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            Map<String, Integer> columns = readHeaderColumns(row);
            if (columns.containsKey("DATE") && columns.containsKey("PRODUCTNAMES") && columns.containsKey("ASIN")) {
                return new HeaderRow(rowIndex + 1, columns);
            }
        }
        throw new IllegalArgumentException("Could not find a valid PROFITS header row.");
    }

    private Map<String, Integer> readHeaderColumns(Row row) {
        Map<String, Integer> columns = new HashMap<>();
        if (row == null) {
            return columns;
        }
        for (Cell cell : row) {
            String value = normalizeHeader(readString(cell));
            if (!value.isBlank()) {
                columns.put(value, cell.getColumnIndex());
            }
        }
        return columns;
    }

    private ParseResult parseRow(Row row, Map<String, Integer> columns, String sourceFileName, String importedBy) {
        int rowNumber = row.getRowNum() + 1;
        String asin = clean(readString(row, columns.get("ASIN")));
        String sku = clean(readString(row, columns.get("SKU")));
        String productName = clean(readString(row, columns.get("PRODUCTNAMES")));

        if (historicalSaleRepository.existsBySourceFileNameIgnoreCaseAndSourceSheetIgnoreCaseAndSourceRowNumber(sourceFileName, PROFITS_SHEET, rowNumber)) {
            return rejected(rowNumber, asin, sku, productName, "Historical sale has already been imported from this source row.");
        }

        Optional<Product> product = matchProduct(asin, sku);
        if (product.isEmpty()) {
            return rejected(rowNumber, asin, sku, productName, "No product match found by ASIN or SKU.");
        }

        LocalDate saleDate = readDate(row, columns.get("DATE"));
        if (saleDate == null) {
            return rejected(rowNumber, asin, sku, productName, "Missing or invalid sale date.");
        }

        Integer fixedQuantity = readInteger(row, columns.get("FQTY"));
        BigDecimal unitCost = readMoney(row, columns.get("COSTPERPRODUCT"));
        BigDecimal fbaFees = readMoney(row, columns.get("FBAFEES"));
        BigDecimal salesTax = readMoney(row, columns.get("SALESTAX"));
        BigDecimal totalCost = readMoney(row, columns.get("TOTALCOST"));
        BigDecimal totalInvestment = readMoney(row, columns.get("TOTALINVESTMENT"));
        BigDecimal profit = readMoney(row, columns.get("PROFIT"));

        SalesTotals salesTotals = readSalesTotals(row, columns);
        if (salesTotals.rejectionReason() != null) {
            return rejected(rowNumber, asin, sku, productName, salesTotals.rejectionReason());
        }

        Product matched = product.get();
        HistoricalSale sale = new HistoricalSale();
        sale.setProduct(matched);
        sale.setSourceFileName(sourceFileName);
        sale.setSourceSheet(PROFITS_SHEET);
        sale.setSourceRowNumber(rowNumber);
        sale.setSaleDate(saleDate);
        sale.setProductName(productName == null ? matched.getName() : productName);
        sale.setSku(sku == null ? matched.getSku() : sku);
        sale.setAsin(asin == null ? matched.getAsin() : asin);
        sale.setFixedQuantity(fixedQuantity);
        sale.setSoldQuantity(salesTotals.quantity());
        sale.setUnitCost(unitCost);
        sale.setAverageSellingPrice(salesTotals.revenue().divide(BigDecimal.valueOf(salesTotals.quantity()), 2, RoundingMode.HALF_UP));
        sale.setRevenue(salesTotals.revenue());
        sale.setFbaFees(fbaFees);
        sale.setSalesTax(salesTax);
        sale.setTotalCost(totalCost);
        sale.setTotalInvestment(totalInvestment);
        sale.setProfit(profit);
        sale.setImportedBy(importedBy);
        sale.setImportedAt(Instant.now());
        return new ParseResult(sale, null);
    }

    private Optional<Product> matchProduct(String asin, String sku) {
        if (asin != null) {
            List<Product> products = productRepository.findByAsinIgnoreCase(asin);
            if (products.size() == 1) {
                return Optional.of(products.get(0));
            }
            if (products.size() > 1) {
                return Optional.empty();
            }
        }
        if (sku != null) {
            return productRepository.findBySkuIgnoreCase(sku);
        }
        return Optional.empty();
    }

    private SalesTotals readSalesTotals(Row row, Map<String, Integer> columns) {
        int totalQuantity = 0;
        BigDecimal revenue = BigDecimal.ZERO;
        for (int index = 1; index <= 3; index++) {
            Integer quantity = readInteger(row, columns.get(index + "SQTY"));
            BigDecimal price = readMoney(row, columns.get(index + "SALESPRICE"));
            if (quantity == null && price == null) {
                continue;
            }
            if (quantity == null || quantity <= 0) {
                return new SalesTotals(0, BigDecimal.ZERO, "Sales quantity must be a positive whole number when a sales price is present.");
            }
            if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
                return new SalesTotals(0, BigDecimal.ZERO, "Sales price is required for every sold quantity.");
            }
            totalQuantity += quantity;
            revenue = revenue.add(price.multiply(BigDecimal.valueOf(quantity)));
        }
        if (totalQuantity <= 0) {
            return new SalesTotals(0, BigDecimal.ZERO, "No sold quantity found.");
        }
        return new SalesTotals(totalQuantity, revenue.setScale(2, RoundingMode.HALF_UP), null);
    }

    private ParseResult rejected(int rowNumber, String asin, String sku, String productName, String reason) {
        return new ParseResult(null, new HistoricalSaleRejectedRecord(rowNumber, asin, sku, productName, reason));
    }

    private boolean isBlank(Row row) {
        if (row == null) {
            return true;
        }
        for (Cell cell : row) {
            if (cell != null && cell.getCellType() != CellType.BLANK && !readString(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }

    private String readString(Row row, Integer columnIndex) {
        if (row == null || columnIndex == null) {
            return null;
        }
        return readString(row.getCell(columnIndex));
    }

    private String readString(Cell cell) {
        if (cell == null) {
            return "";
        }
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getLocalDateTimeCellValue().toLocalDate().toString()
                    : BigDecimal.valueOf(cell.getNumericCellValue()).stripTrailingZeros().toPlainString();
            case BOOLEAN -> Boolean.toString(cell.getBooleanCellValue());
            case FORMULA -> readFormulaValue(cell);
            default -> "";
        };
    }

    private String readFormulaValue(Cell cell) {
        return switch (cell.getCachedFormulaResultType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? cell.getLocalDateTimeCellValue().toLocalDate().toString()
                    : BigDecimal.valueOf(cell.getNumericCellValue()).stripTrailingZeros().toPlainString();
            case BOOLEAN -> Boolean.toString(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private LocalDate readDate(Row row, Integer columnIndex) {
        if (row == null || columnIndex == null) {
            return null;
        }
        Cell cell = row.getCell(columnIndex);
        if (cell == null) {
            return null;
        }
        if ((cell.getCellType() == CellType.NUMERIC || cell.getCellType() == CellType.FORMULA) && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
        String value = clean(readString(cell));
        if (value == null) {
            return null;
        }
        if (value.contains(" ")) {
            value = value.substring(0, value.indexOf(' '));
        }
        for (DateTimeFormatter formatter : dateFormatters()) {
            try {
                return LocalDate.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
                // Try the next known export format.
            }
        }
        return null;
    }

    private List<DateTimeFormatter> dateFormatters() {
        return List.of(
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("M/d/yyyy"),
                DateTimeFormatter.ofPattern("M-d-yyyy"),
                DateTimeFormatter.ofPattern("d/M/yyyy"),
                DateTimeFormatter.ofPattern("d-M-yyyy")
        );
    }

    private Integer readInteger(Row row, Integer columnIndex) {
        BigDecimal value = readMoney(row, columnIndex);
        if (value == null) {
            return null;
        }
        try {
            return value.stripTrailingZeros().intValueExact();
        } catch (ArithmeticException ex) {
            return null;
        }
    }

    private BigDecimal readMoney(Row row, Integer columnIndex) {
        String raw = clean(readString(row, columnIndex));
        if (raw == null) {
            return null;
        }
        String normalized = raw.replace("$", "").replace(",", "").trim();
        boolean negative = normalized.startsWith("(") && normalized.endsWith(")");
        if (negative) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }
        try {
            BigDecimal value = new BigDecimal(normalized);
            return (negative ? value.negate() : value).setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String cleanUser(String userEmail) {
        return userEmail == null || userEmail.isBlank() ? "system" : userEmail.trim();
    }

    private String cleanFileName(String fileName) {
        return fileName == null || fileName.isBlank() ? "uploaded-workbook.xlsx" : fileName.trim();
    }

    private String normalizeHeader(String value) {
        if (value == null) {
            return "";
        }
        return value.toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]+", "");
    }

    private record HeaderRow(int rowNumber, Map<String, Integer> columns) {
    }

    private record SalesTotals(Integer quantity, BigDecimal revenue, String rejectionReason) {
    }

    private record ParseResult(HistoricalSale sale, HistoricalSaleRejectedRecord rejection) {
    }
}
