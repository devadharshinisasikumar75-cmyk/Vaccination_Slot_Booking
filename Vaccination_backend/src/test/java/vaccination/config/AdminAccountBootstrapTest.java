package vaccination.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import vaccination.model.User;
import vaccination.repository.UserRepository;
import vaccination.service.PasswordService;

class AdminAccountBootstrapTest {
    private final UserRepository userRepository = Mockito.mock(UserRepository.class);
    private final PasswordService passwordService = new PasswordService();

    @Test
    void createsFirstAdminFromConfiguredCredentials() {
        Mockito.when(userRepository.findByEmail("admin@example.test")).thenReturn(null);
        Mockito.when(userRepository.findAllByRoleIgnoreCase("ADMIN")).thenReturn(List.of());

        bootstrap("admin@example.test", "new-secure-password").run(null);

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        Mockito.verify(userRepository).save(savedUser.capture());
        assertEquals("ADMIN", savedUser.getValue().getRole());
        assertTrue(passwordService.matches(
                "new-secure-password", savedUser.getValue().getPassword()));
    }

    @Test
    void resetsPasswordForConfiguredExistingAdmin() {
        User admin = new User(
                "Existing Admin",
                "admin@example.test",
                passwordService.encode("previous-secure-password"),
                "ADMIN");
        Mockito.when(userRepository.findByEmail("admin@example.test")).thenReturn(admin);

        bootstrap("admin@example.test", "new-secure-password").run(null);

        assertTrue(passwordService.matches("new-secure-password", admin.getPassword()));
        Mockito.verify(userRepository).save(admin);
    }

    @Test
    void updatesTheOnlyExistingAdminToConfiguredCredentials() {
        User existingAdmin = new User(
                "Existing Admin",
                "other@example.test",
                passwordService.encode("previous-secure-password"),
                "ADMIN");
        Mockito.when(userRepository.findByEmail("admin@example.test")).thenReturn(null);
        Mockito.when(userRepository.findAllByRoleIgnoreCase("ADMIN"))
                .thenReturn(List.of(existingAdmin));

        bootstrap("admin@example.test", "new-secure-password").run(null);

        assertEquals("admin@example.test", existingAdmin.getEmail());
        assertTrue(passwordService.matches(
                "new-secure-password", existingAdmin.getPassword()));
        Mockito.verify(userRepository).save(existingAdmin);
    }

    @Test
    void doesNotModifyMultipleAdminsWhenConfiguredEmailDoesNotMatch() {
        User firstAdmin = new User("First Admin", "first@example.test", "hash", "ADMIN");
        User secondAdmin = new User("Second Admin", "second@example.test", "hash", "ADMIN");
        Mockito.when(userRepository.findByEmail("admin@example.test")).thenReturn(null);
        Mockito.when(userRepository.findAllByRoleIgnoreCase("ADMIN"))
                .thenReturn(List.of(firstAdmin, secondAdmin));

        bootstrap("admin@example.test", "new-secure-password").run(null);

        Mockito.verify(userRepository, Mockito.never()).save(Mockito.any());
    }

    @Test
    void refusesToChangePasswordForConfiguredNonAdminAccount() {
        Mockito.when(userRepository.findByEmail("admin@example.test"))
                .thenReturn(new User("Patient", "admin@example.test", "password", "USER"));

        assertThrows(
                IllegalStateException.class,
                () -> bootstrap("admin@example.test", "new-secure-password").run(null));
        Mockito.verify(userRepository, Mockito.never()).save(Mockito.any());
    }

    private AdminAccountBootstrap bootstrap(String email, String password) {
        return new AdminAccountBootstrap(userRepository, passwordService, email, password);
    }
}
