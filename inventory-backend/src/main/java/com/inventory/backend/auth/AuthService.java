package com.inventory.backend.auth;

import com.inventory.backend.security.JwtService;
import com.inventory.backend.user.UserRepository;
import com.inventory.backend.user.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        var user = userRepository.findByEmailIgnoreCase(request.email()).orElseThrow();
        return new AuthResponse("Bearer", jwtService.generateToken(user), UserResponse.from(user));
    }
}
