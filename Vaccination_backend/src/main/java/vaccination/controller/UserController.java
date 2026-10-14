package vaccination.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import vaccination.model.User;
import vaccination.repository.UserRepository;
import vaccination.security.UserAccessService;
import vaccination.service.PasswordService;

@RestController
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private UserAccessService userAccessService;

    @GetMapping("/api/users")
    public Iterable<User> getUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/api/admin/staff")
    public List<Map<String, Object>> getHealthcareStaff() {
        return userRepository.findAllByRoleIgnoreCase("HEALTHCARE_STAFF")
                .stream()
                .map(user -> {
                    Map<String, Object> staff = new HashMap<>();
                    staff.put("id", user.getId());
                    staff.put("name", user.getName() == null ? "" : user.getName());
                    staff.put("email", user.getEmail() == null ? "" : user.getEmail());
                    staff.put("role", user.getRole());
                    staff.put("status", "ACTIVE");
                    return staff;
                })
                .toList();
    }

    @PostMapping("/api/admin/staff")
    public ResponseEntity<?> createHealthcareStaff(
            @RequestBody Map<String, String> request) {
        String name = request == null ? null : request.get("name");
        String email = request == null ? null : request.get("email");
        String password = request == null ? null : request.get("password");

        if (name == null || name.isBlank() || email == null || email.isBlank()
                || password == null || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name, email, and password are required."));
        }

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (!normalizedEmail.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Enter a valid email address."));
        }
        if (password.length() < 12) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Staff password must contain at least 12 characters."));
        }
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already registered."));
        }

        User staff = new User(
                name.trim(),
                normalizedEmail,
                passwordService.encode(password),
                "HEALTHCARE_STAFF");
        User savedStaff = userRepository.save(staff);

        Map<String, Object> staffData = new HashMap<>();
        staffData.put("id", savedStaff.getId());
        staffData.put("name", savedStaff.getName());
        staffData.put("email", savedStaff.getEmail());
        staffData.put("role", savedStaff.getRole());
        staffData.put("status", "ACTIVE");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Healthcare staff account created.", "staff", staffData));
    }

    @PutMapping("/api/users/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestBody User updatedUser,
            Authentication authentication) {

        try {
            if (!userAccessService.canManageUser(authentication, userId)) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "You are not allowed to update this profile."));
            }

            User user = userRepository.findById(userId).orElse(null);

            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            if (updatedUser.getName() != null &&
                    !updatedUser.getName().trim().isEmpty()) {

                user.setName(updatedUser.getName().trim());
            }

            if (updatedUser.getEmail() != null &&
                    !updatedUser.getEmail().trim().isEmpty()) {

                String newEmail = updatedUser.getEmail()
                        .trim()
                        .toLowerCase();

                User existingUser = userRepository.findByEmail(newEmail);

                if (existingUser != null &&
                        !existingUser.getId().equals(userId)) {

                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Email already registered"));
                }

                user.setEmail(newEmail);
            }

            if (updatedUser.getPassword() != null &&
                    !updatedUser.getPassword().trim().isEmpty()) {

                if (updatedUser.getPassword().length() < 8) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Password must contain at least 8 characters."));
                }
                user.setPassword(passwordService.encode(updatedUser.getPassword()));
            }

            User savedUser = userRepository.save(user);

            Map<String, Object> userData = new HashMap<>();

            userData.put("id", savedUser.getId());
            userData.put("name",
                    savedUser.getName() == null ? "" : savedUser.getName());
            userData.put("email",
                    savedUser.getEmail() == null ? "" : savedUser.getEmail());
            userData.put("role",
                    savedUser.getRole() == null ? "USER" : savedUser.getRole());

            Map<String, Object> response = new HashMap<>();

            response.put("message", "Profile updated successfully");
            response.put("user", userData);

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(Map.of("message", "Unable to update profile"));
        }
    }
}