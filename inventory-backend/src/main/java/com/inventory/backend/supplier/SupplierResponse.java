package com.inventory.backend.supplier;

public record SupplierResponse(
        Long id,
        String name,
        String contact,
        String email,
        String phone,
        Integer rating,
        String notes
) {
    public static SupplierResponse from(Supplier supplier) {
        return new SupplierResponse(
                supplier.getId(),
                supplier.getName(),
                supplier.getContact(),
                supplier.getEmail(),
                supplier.getPhone(),
                supplier.getRating(),
                supplier.getNotes()
        );
    }
}
