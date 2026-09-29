package in.sih.vaspattribution.auth.service;

import in.sih.vaspattribution.auth.dto.LoginRequest;
import in.sih.vaspattribution.auth.dto.LoginResponse;
import in.sih.vaspattribution.auth.entity.User;
import in.sih.vaspattribution.auth.repository.UserRepository;
import in.sih.vaspattribution.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("INVALID_CREDENTIALS", "Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("INVALID_CREDENTIALS", "Invalid username or password");
        }

        Instant now = Instant.now();
        long expiresIn = 3600;
        
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("vaspattribution")
                .issuedAt(now)
                .expiresAt(now.plus(expiresIn, ChronoUnit.SECONDS))
                .subject(user.getId().toString())
                .claim("role", user.getRole())
                .claim("username", user.getUsername())
                .build();

        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = this.jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(LoginResponse.UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .role(user.getRole())
                        .build())
                .build();
    }

    public Optional<LoginResponse.UserDto> findCurrentUser(UUID userId) {
        return userRepository.findById(userId)
                .map(user -> LoginResponse.UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .role(user.getRole())
                        .build());
    }
}
