package com.inventory.backend.amazon;

public record AmazonSyncResult(
        int fetched,
        int created,
        int updated,
        int skipped,
        String message
) {
}
