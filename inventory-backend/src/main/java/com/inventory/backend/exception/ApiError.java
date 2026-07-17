package com.inventory.backend.exception;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        int status,
        String error,
        String message,
        String path,
        Map<String, String> validationErrors,
        Instant timestamp
) {
}
