package com.inventory.backend.security;

import com.inventory.backend.user.Role;

public record CurrentUser(
        Long id,
        String name,
        String email,
        Role role
) {
}
