package vaccination.config;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import vaccination.model.User;
import vaccination.repository.UserRepository;
import vaccination.service.PasswordService;

@Component
public class AdminAccountBootstrap implements ApplicationRunner {
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
        if (!userRepository.findAllByRoleIgnoreCase("ADMIN").isEmpty()) {
            return;
        }

        String email = bootstrapEmail.trim().toLowerCase(Locale.ROOT);
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new IllegalStateException("Admin bootstrap email is invalid.");
        }
        if (userRepository.findByEmail(email) != null) {
            throw new IllegalStateException(
                    "Admin bootstrap email already belongs to a non-admin account.");
        }

        User admin = new User(
                "VaxCare Administrator",
                email,
                passwordService.encode(bootstrapPassword),
                "ADMIN");
        userRepository.save(admin);
    }
}
