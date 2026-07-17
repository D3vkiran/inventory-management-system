package com.inventory.backend.shipment;

import java.time.LocalDate;

public record ShipmentResponse(
        Long id,
        Long productId,
        String sku,
        String name,
        Integer quantity,
        String from,
        String to,
        ShipmentStatus status,
        LocalDate shipDate,
        LocalDate receiveDate,
        String notes
) {
    public static ShipmentResponse from(Shipment shipment) {
        return new ShipmentResponse(
                shipment.getId(),
                shipment.getProduct().getId(),
                shipment.getProduct().getSku(),
                shipment.getName(),
                shipment.getQuantity(),
                shipment.getFrom(),
                shipment.getTo(),
                shipment.getStatus(),
                shipment.getShipDate(),
                shipment.getReceiveDate(),
                shipment.getNotes()
        );
    }
}
