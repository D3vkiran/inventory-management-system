package com.inventory.backend.config;

import com.inventory.backend.user.Role;
import com.inventory.backend.user.User;
import com.inventory.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AppProperties appProperties;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) {
        var seed = appProperties.seed();
        if (seed == null || userRepository.existsByEmailIgnoreCase(seed.ownerEmail())) {
            return;
        }

        User owner = new User();
        owner.setName(seed.ownerName());
        owner.setEmail(seed.ownerEmail());
        owner.setPasswordHash(passwordEncoder.encode(seed.ownerPassword()));
        owner.setRole(Role.OWNER);
        owner.setEnabled(true);
        userRepository.save(owner);
    }
}
