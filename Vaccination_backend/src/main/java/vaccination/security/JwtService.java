package vaccination.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Locale;
import java.util.Set;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import vaccination.model.User;

@Service
public class JwtService {
    private static final Set<String> ALLOWED_ROLES =
            Set.of("USER", "HEALTHCARE_STAFF", "ADMIN");

    private final String secret;
    private final long expirationHours;

    public JwtService(
            @Value("${app.jwt.secret:}") String secret,
            @Value("${app.jwt.expiration-hours:12}") long expirationHours) {
        this.secret = secret;
        this.expirationHours = expirationHours;
    }

    public String createToken(User user) {
        if (user.getId() == null || user.getEmail() == null) {
            throw new IllegalArgumentException("A saved user is required to create an access token.");
        }
        return createToken(user.getId(), user.getEmail(), user.getRole());
    }

    public String createToken(Long userId, String email, String role) {
        if (userId == null || email == null || email.isBlank()) {
            throw new IllegalArgumentException("A saved user is required to create an access token.");
        }
        role = normalizeRole(role);
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expirationHours, ChronoUnit.HOURS)))
                .signWith(signingKey())
                .compact();
    }

    public AuthenticatedUser parseToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Object id = claims.get("userId");
        if (!(id instanceof Number userId)) {
            throw new IllegalArgumentException("Access token has no valid user id.");
        }
        return new AuthenticatedUser(
                userId.longValue(),
                claims.getSubject(),
                normalizeRole(claims.get("role", String.class)));
    }

    public void validateConfiguration() {
        signingKey();
        if (expirationHours < 1 || expirationHours > 168) {
            throw new IllegalStateException("JWT_EXPIRATION_HOURS must be between 1 and 168.");
        }
    }

    private SecretKey signingKey() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must contain at least 32 bytes.");
        }
        if (expirationHours < 1 || expirationHours > 168) {
            throw new IllegalStateException("JWT_EXPIRATION_HOURS must be between 1 and 168.");
        }
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private String normalizeRole(String role) {
        if (role == null || !ALLOWED_ROLES.contains(role.trim().toUpperCase(Locale.ROOT))) {
            throw new IllegalArgumentException("User has an unsupported role.");
        }
        return role.trim().toUpperCase(Locale.ROOT);
    }
}
