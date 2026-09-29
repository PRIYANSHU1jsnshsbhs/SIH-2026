package in.sih.vaspattribution;

import in.sih.vaspattribution.auth.dto.LoginRequest;
import in.sih.vaspattribution.auth.entity.User;
import in.sih.vaspattribution.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
public class AuthIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private org.springframework.security.oauth2.jwt.JwtEncoder jwtEncoder;

    @BeforeEach
    public void setup() {
        userRepository.deleteAll();
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("testadmin");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setRole("ADMIN");
        user.setName("Test Admin");
        userRepository.save(user);
    }

    @Test
    public void testAuthRoundTrip() {
        // 1. Login
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testadmin");
        loginRequest.setPassword("password123");
        ResponseEntity<Map> loginResponse = restTemplate.postForEntity("/api/v1/auth/login", loginRequest, Map.class);
        
        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        Map<String, Object> body = loginResponse.getBody();
        assertNotNull(body);
        Map<String, Object> data = (Map<String, Object>) body.get("data");
        assertNotNull(data);
        String token = (String) data.get("access_token");
        assertNotNull(token);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> casesResponse = restTemplate.exchange("/api/v1/reports", HttpMethod.GET, entity, Map.class);
        assertEquals(HttpStatus.OK, casesResponse.getStatusCode());

        // 3. No token -> rejected
        ResponseEntity<Map> noTokenResponse = restTemplate.getForEntity("/api/v1/reports", Map.class);
        assertEquals(HttpStatus.UNAUTHORIZED, noTokenResponse.getStatusCode());

        // 4. Tampered token -> rejected
        headers.setBearerAuth(token + "tamper");
        HttpEntity<String> tamperedEntity = new HttpEntity<>(headers);
        ResponseEntity<Map> tamperedResponse = restTemplate.exchange("/api/v1/reports", HttpMethod.GET, tamperedEntity, Map.class);
        assertEquals(HttpStatus.UNAUTHORIZED, tamperedResponse.getStatusCode());

        // 5. Random malformed token -> rejected
        headers.setBearerAuth("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.malformed.token");
        HttpEntity<String> malformedEntity = new HttpEntity<>(headers);
        ResponseEntity<Map> malformedResponse = restTemplate.exchange("/api/v1/reports", HttpMethod.GET, malformedEntity, Map.class);
        assertEquals(HttpStatus.UNAUTHORIZED, malformedResponse.getStatusCode());
        
        // 6. Expired token -> rejected
        java.time.Instant now = java.time.Instant.now();
        org.springframework.security.oauth2.jwt.JwtClaimsSet claims = org.springframework.security.oauth2.jwt.JwtClaimsSet.builder()
                .issuer("http://localhost:8081")
                .issuedAt(now.minusSeconds(3600))
                .expiresAt(now.minusSeconds(1800))
                .subject(UUID.randomUUID().toString())
                .claim("username", "testadmin")
                .claim("role", "ADMIN")
                .build();
        org.springframework.security.oauth2.jwt.JwsHeader jwsHeader = org.springframework.security.oauth2.jwt.JwsHeader.with(() -> "HS256").build();
        String expiredToken = jwtEncoder.encode(org.springframework.security.oauth2.jwt.JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
        
        headers.setBearerAuth(expiredToken);
        HttpEntity<String> expiredEntity = new HttpEntity<>(headers);
        ResponseEntity<Map> expiredResponse = restTemplate.exchange("/api/v1/reports", HttpMethod.GET, expiredEntity, Map.class);
        assertEquals(HttpStatus.UNAUTHORIZED, expiredResponse.getStatusCode());
    }

    @Test
    public void testAuthMeRejectsTokenWhenUserNoLongerExists() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testadmin");
        loginRequest.setPassword("password123");
        ResponseEntity<Map> loginResponse = restTemplate.postForEntity("/api/v1/auth/login", loginRequest, Map.class);

        Map<String, Object> data = (Map<String, Object>) loginResponse.getBody().get("data");
        String token = (String) data.get("access_token");
        userRepository.deleteAll();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        ResponseEntity<Map> meResponse = restTemplate.exchange(
                "/api/v1/auth/me",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        );

        assertEquals(HttpStatus.UNAUTHORIZED, meResponse.getStatusCode());
        Map<String, Object> error = (Map<String, Object>) meResponse.getBody().get("error");
        assertEquals("INVALID_USER", error.get("code"));
    }
}
