package in.sih.vaspattribution.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LoginResponse {
    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("token_type")
    private String tokenType;

    @JsonProperty("expires_in")
    private long expiresIn;

    private UserDto user;

    @Data
    @Builder
    public static class UserDto {
        private UUID id;
        private String name;
        private String role;
    }
}
