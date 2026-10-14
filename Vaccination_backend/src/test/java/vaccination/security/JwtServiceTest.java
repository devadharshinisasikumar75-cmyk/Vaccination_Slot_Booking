package vaccination.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import io.jsonwebtoken.JwtException;

class JwtServiceTest {
    private static final String SECRET =
            "this-is-a-test-jwt-signing-secret-with-at-least-thirty-two-bytes";

    @Test
    void signedTokensCarryTheTrustedUserIdentityAndRole() {
        JwtService jwtService = new JwtService(SECRET, 12);

        String token = jwtService.createToken(42L, "user@example.com", "USER");
        AuthenticatedUser user = jwtService.parseToken(token);

        assertEquals(42L, user.id());
        assertEquals("user@example.com", user.email());
        assertEquals("USER", user.role());
    }

    @Test
    void modifiedTokensAreRejected() {
        JwtService jwtService = new JwtService(SECRET, 12);
        String token = jwtService.createToken(42L, "user@example.com", "USER");

        assertThrows(JwtException.class, () -> jwtService.parseToken(token + "x"));
    }
}
