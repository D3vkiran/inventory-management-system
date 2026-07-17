package com.inventory.backend.amazon;

public class AmazonApiException extends RuntimeException {
    public AmazonApiException(String message) {
        super(message);
    }

    public AmazonApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
