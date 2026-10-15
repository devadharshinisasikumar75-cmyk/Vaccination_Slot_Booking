package vaccination.config;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import vaccination.model.User;
import vaccination.repository.UserRepository;
import vaccination.service.PasswordService;

@Component
public class AdminAccountBootstrap implements ApplicationRunner {
    private static final Logger LOGGER = LoggerFactory.getLogger(AdminAccountBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordService passwordService;
    private final String bootstrapEmail;
    private final String bootstrapPassword;

    public AdminAccountBootstrap(
            UserRepository userRepository,
            PasswordService passwordService,
            @Value("${app.admin.bootstrap-email:}") String bootstrapEmail,
            @Value("${app.admin.bootstrap-password:}") String bootstrapPassword) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.bootstrapEmail = bootstrapEmail;
        this.bootstrapPassword = bootstrapPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean hasEmail = bootstrapEmail != null && !bootstrapEmail.isBlank();
        boolean hasPassword = bootstrapPassword != null && !bootstrapPassword.isBlank();
        if (!hasEmail && !hasPassword) {
            return;
        }
        if (!hasEmail || !hasPassword || bootstrapPassword.length() < 12) {
            throw new IllegalStateException(
                    "Admin bootstrap requires both email and a password of at least 12 characters.");
        }

        String email = bootstrapEmail.trim().toLowerCase(Locale.ROOT);
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new IllegalStateException("Admin bootstrap email is invalid.");
        }
        User existingUser = userRepository.findByEmail(email);
        if (existingUser != null && !"ADMIN".equalsIgnoreCase(existingUser.getRole())) {
            throw new IllegalStateException(
                    "Admin bootstrap email already belongs to a non-admin account.");
        }

        if (existingUser != null) {
            if (!passwordService.matches(bootstrapPassword, existingUser.getPassword())) {
                existingUser.setPassword(passwordService.encode(bootstrapPassword));
                userRepository.save(existingUser);
            }
            return;
        }

        var existingAdmins = userRepository.findAllByRoleIgnoreCase("ADMIN");
        if (existingAdmins.size() == 1) {
            User existingAdmin = existingAdmins.get(0);
            existingAdmin.setEmail(email);
            existingAdmin.setPassword(passwordService.encode(bootstrapPassword));
            userRepository.save(existingAdmin);
            LOGGER.info("Updated the existing admin account from configured bootstrap credentials.");
            return;
        }
        if (!existingAdmins.isEmpty()) {
            LOGGER.warn(
                    "Admin bootstrap was skipped because multiple admins exist and the configured email does not match one.");
            return;
        }

        User admin = new User(
                "VaxCare Administrator",
                email,
                passwordService.encode(bootstrapPassword),
                "ADMIN");
        userRepository.save(admin);
    }
}
