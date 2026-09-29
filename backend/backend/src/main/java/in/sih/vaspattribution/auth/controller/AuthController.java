package in.sih.vaspattribution.auth.controller;

import in.sih.vaspattribution.auth.dto.LoginRequest;
import in.sih.vaspattribution.auth.dto.LoginResponse;
import in.sih.vaspattribution.auth.service.AuthService;
import in.sih.vaspattribution.common.ApiResponse;
import in.sih.vaspattribution.common.ApiError;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse.UserDto>> me(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return authService.findCurrentUser(userId)
                .map(user -> ResponseEntity.ok(ApiResponse.success(user)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(new ApiError(
                                "INVALID_USER",
                                "Authenticated user no longer exists"
                        ))));
    }
}
