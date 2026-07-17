package com.inventory.backend.amazon;

import java.net.URI;
import java.util.Map;

record SignedAmazonRequest(
        URI uri,
        Map<String, String> headers
) {
}
