package vaccination.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class PasswordServiceTest {
    private final PasswordService passwordService = new PasswordService();

    @Test
    void encodedPasswordsCanBeVerifiedWithoutStoringTheOriginal() {
        String encoded = passwordService.encode("correct horse battery");

        assertFalse(encoded.contains("correct horse battery"));
        assertTrue(passwordService.isEncoded(encoded));
        assertTrue(passwordService.matches("correct horse battery", encoded));
        assertFalse(passwordService.matches("incorrect password", encoded));
    }

    @Test
    void legacyPlainTextPasswordsCanBeVerifiedForOneTimeMigration() {
        assertTrue(passwordService.matches("legacy password", "legacy password"));
        assertFalse(passwordService.isEncoded("legacy password"));
    }
}
