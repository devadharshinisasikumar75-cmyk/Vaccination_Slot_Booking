package vaccination.service;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.regex.Pattern;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

import org.springframework.stereotype.Service;

@Service
public class PasswordService {
    private static final String PREFIX = "pbkdf2";
    private static final int ITERATIONS = 310_000;
    private static final int SALT_BYTES = 16;
    private static final int HASH_BITS = 256;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Pattern HASH_PATTERN = Pattern.compile(
            "^pbkdf2\\$(\\d{6})\\$([A-Za-z0-9+/]+={0,2})\\$([A-Za-z0-9+/]+={0,2})$");

    public String encode(String password) {
        byte[] salt = new byte[SALT_BYTES];
        RANDOM.nextBytes(salt);
        byte[] hash = derive(password, salt, ITERATIONS);
        return PREFIX + "$" + ITERATIONS + "$"
                + Base64.getEncoder().encodeToString(salt) + "$"
                + Base64.getEncoder().encodeToString(hash);
    }

    public boolean matches(String password, String storedPassword) {
        if (password == null || storedPassword == null) {
            return false;
        }

        var matcher = HASH_PATTERN.matcher(storedPassword);
        if (!matcher.matches()) {
            return MessageDigest.isEqual(
                    password.getBytes(StandardCharsets.UTF_8),
                    storedPassword.getBytes(StandardCharsets.UTF_8));
        }

        int iterations = Integer.parseInt(matcher.group(1));
        if (iterations < 100_000 || iterations > 1_000_000) {
            return false;
        }

        byte[] salt = Base64.getDecoder().decode(matcher.group(2));
        byte[] expectedHash = Base64.getDecoder().decode(matcher.group(3));
        if (salt.length != SALT_BYTES || expectedHash.length != HASH_BITS / 8) {
            return false;
        }
        return MessageDigest.isEqual(expectedHash, derive(password, salt, iterations));
    }

    public boolean isEncoded(String storedPassword) {
        return storedPassword != null && HASH_PATTERN.matcher(storedPassword).matches();
    }

    private byte[] derive(String password, byte[] salt, int iterations) {
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, HASH_BITS);
        try {
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
                    .generateSecret(spec)
                    .getEncoded();
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Could not securely process the password.", ex);
        } finally {
            spec.clearPassword();
        }
    }
}
