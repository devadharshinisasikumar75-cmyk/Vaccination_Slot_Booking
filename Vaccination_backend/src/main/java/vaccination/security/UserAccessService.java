package vaccination.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class UserAccessService {
    public boolean canReadUser(Authentication authentication, Long userId) {
        AuthenticatedUser currentUser = currentUser(authentication);
        return currentUser != null
                && (currentUser.id().equals(userId)
                || hasRole(authentication, "ADMIN")
                || hasRole(authentication, "HEALTHCARE_STAFF"));
    }

    public boolean canManageUser(Authentication authentication, Long userId) {
        AuthenticatedUser currentUser = currentUser(authentication);
        return currentUser != null
                && (currentUser.id().equals(userId) || hasRole(authentication, "ADMIN"));
    }

    public boolean isCurrentUser(Authentication authentication, Long userId) {
        AuthenticatedUser currentUser = currentUser(authentication);
        return currentUser != null && currentUser.id().equals(userId);
    }

    private AuthenticatedUser currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            return null;
        }
        return user;
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }
}
