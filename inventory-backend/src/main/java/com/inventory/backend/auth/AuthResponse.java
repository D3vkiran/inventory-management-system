package com.inventory.backend.auth;

import com.inventory.backend.user.UserResponse;

public record AuthResponse(
        String tokenType,
        String accessToken,
        UserResponse user
) {
}
