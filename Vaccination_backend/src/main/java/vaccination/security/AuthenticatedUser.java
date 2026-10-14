package vaccination.security;

public record AuthenticatedUser(Long id, String email, String role) {
}
