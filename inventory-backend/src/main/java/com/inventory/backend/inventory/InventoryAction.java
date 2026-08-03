package com.inventory.backend.inventory;

public enum InventoryAction {
    RECEIVE_STOCK(1),
    SOLD(-1),
    RETURN_RECEIVED(1),
    RETURN_TO_SUPPLIER(-1),
    DUMP_DISPOSE(-1),
    DAMAGED(-1),
    LOST_MISSING(-1),
    GIVEAWAY_SAMPLE(-1),
    MANUAL_ADJUSTMENT(0),
    RESET_STOCK(0);

    private final int direction;

    InventoryAction(int direction) {
        this.direction = direction;
    }

    public boolean increasesStock() {
        return direction > 0;
    }

    public boolean decreasesStock() {
        return direction < 0;
    }

    public boolean requiresReason() {
        return this == DUMP_DISPOSE
                || this == DAMAGED
                || this == LOST_MISSING
                || this == RETURN_TO_SUPPLIER
                || this == GIVEAWAY_SAMPLE
                || this == RESET_STOCK;
    }

    public boolean resetsStock() {
        return this == RESET_STOCK;
    }
}
