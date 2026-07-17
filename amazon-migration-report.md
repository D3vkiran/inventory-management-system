# Amazon Data Migration Report

Generated from `amazon report.zip`.

## Source Reports Analyzed

| Report | Rows | Result |
| --- | ---: | --- |
| `trying smthng/50289020649.txt` | 0 data rows | Headers only. No sales imported. |
| `trying smthng/50291020649.csv` | 0 data rows | Headers only. No shipment or inventory-event records imported. |
| `trying smthng/inventory-export-2026-07-15.csv` | 49 data rows | Products and available Amazon FBA inventory imported. |

## Imported Records

- Products: 49
- Inventory rows: 22
- Available inventory quantity imported: 983
- Suppliers: 0
- Purchases: 0
- Sales: 0
- Shipments: 0

## Skipped Records

- Sales: skipped because the Amazon order report contained no data rows.
- Shipments: skipped because the Amazon event/report CSV contained no data rows.
- Purchases: skipped because no purchase report or supplier purchase history was provided.
- Suppliers: skipped because no supplier report or supplier-identifying fields were provided.

## Missing Fields

- Product UPC: not present in supplied reports.
- Product category, size, and color: not present as separate fields. No parsing was guessed from titles or SKUs.
- Default sale price: not present in supplied reports.
- Supplier name/contact/email/phone: not present in supplied reports.
- Purchase date, invoice, and true purchase quantity by supplier: not present in supplied reports.
- Sales price, Amazon fees, order IDs, and shipped quantities: no populated sales records were present.
- Shipment names, statuses, ship dates, and receive dates: no populated shipment/event records were present.

## Manual Review Items

- Unclassified Amazon Inventory quantity requiring manual review: 409
- These units are present in `Total` but not in `Available`. They were not imported into application inventory because their status cannot be mapped confidently.

| SKU | ASIN | Product | Available Imported | Source Total | Unclassified Quantity |
| --- | --- | --- | ---: | ---: | ---: |
| `B0058Z33FG-M` | `B0058Z33FG` | NIKE Performance Cushion Quarter Socks with Bag (6 Pairs) | 10 | 20 | 10 |
| `B07FKFFTQS-M` | `B07FKFFTQS` | Nike Men's Sportswear Club T Shirt | 20 | 70 | 50 |
| `B07FK8LHF8-M` | `B07FK8LHF8` | Nike Women's Unisex Everyday Cushion No Show 3 Pair | 10 | 19 | 9 |
| `B007OY4AFQ-M` | `B007OY4AFQ` | NIKE Men's Classic | 20 | 39 | 19 |
| `B007OY4AB0-L` | `B007OY4AB0` | Nike Men's Training T-Shirt | 20 | 40 | 20 |
| `B07BPL162D-L` | `B07BPL162D` | Nike Dri-FIT Icon shorts | 10 | 20 | 10 |
| `B0916794ZH-M` | `B0916794ZH` | NIKE SOCKS WHITE | 125 | 171 | 46 |
| `B08KWPQMFB-3-MONTHS` | `B08KWPQMFB` | Nike Kids Baby Girl's Sportswear All Over Print Smiley Long Sleeve Footed Coverall (Infant) | 50 | 59 | 9 |
| `B0CSDWZP28-L` | `B0CSDWZP28` | Nike Men's Graphics Logo Sportswear T-Shirt | 12 | 24 | 12 |
| `B08DKYKTTH-10-0` | `B08DKYKTTH` | Converse Unisex Chuck Taylor All Star Ox 159485 Trainers, White, 39.5 EU | 10 | 20 | 10 |
| `B0DLKM88VQ-ONE-SIZE` | `B0DLKM88VQ` | Nike 2024 Cuffed Dri-FIT U Peak Beanie (One Size) (Black) | 40 | 76 | 36 |
| `B0959JT4PV-ONE-SIZE` | `B0959JT4PV` | Nike unisex-adult mens Balaclava | 86 | 112 | 26 |
| `B019DLSDR8-MEDIUM` | `B019DLSDR8` | NIKE Sportswear Men's Pullover Club Hoodie | 212 | 234 | 22 |
| `B08KWMTQPK-0-3-MONTHS` | `B08KWMTQPK` | Nike Kids Baby Girl's Sportswear All Over Print Smiley Long Sleeve Footed Coverall (Infant) | 130 | 260 | 130 |

## Inventory Consistency Check

- Source available quantity: 983
- Application imported available quantity: 983
- Source total quantity: 1392
- Unclassified quantity not imported: 409
- Imported available + unclassified quantity: 1392
- Source total inventory value from report: $24399.50
- Recalculated source total inventory value: $24399.73
- Imported available inventory value: $18381.88
- Unclassified inventory value requiring review: $6017.85

Result: available inventory imported into the application matches the source `Available` total exactly. The remaining source `Total - Available` quantity is reported for manual review and was not assigned a guessed status.
