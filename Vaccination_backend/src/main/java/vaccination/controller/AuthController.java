package vaccination.controller;

import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import vaccination.model.User;
import vaccination.model.LoginHistory;
import vaccination.repository.LoginHistoryRepository;
import vaccination.repository.UserRepository;
import vaccination.security.JwtService;
import vaccination.service.OtpService;
import vaccination.service.PasswordService;

@RestController
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginHistoryRepository loginHistoryRepository;

    @Autowired
    private OtpService otpService;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/api/otp/send")
    public ResponseEntity<?> sendOtp(
            @RequestBody Map<String, String> request) {

        try {

            if (request == null ||
                    request.get("email") == null ||
                    request.get("email").trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Email is required"
                        ));
            }

            String email = request.get("email")
                    .trim()
                    .toLowerCase();

            if (!email.matches(
                    "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Enter a valid email address"
                        ));
            }

            if (userRepository.findByEmail(email) != null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Email already registered"
                        ));
            }

            otpService.sendOtp(email);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "OTP sent successfully"
                    )
            );

        } catch (IllegalStateException e) {
            return ResponseEntity.status(503)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(Map.of(
                            "message",
                            "Unable to send OTP. Please try again."
                    ));
        }
    }

    @PostMapping("/api/otp/verify")
    public ResponseEntity<?> verifyOtp(
            @RequestBody Map<String, String> request) {

        try {

            if (request == null ||
                    request.get("email") == null ||
                    request.get("otp") == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Email and OTP are required"
                        ));
            }

            String email = request.get("email")
                    .trim()
                    .toLowerCase();

            String otp = request.get("otp")
                    .trim();

            boolean verified =
                    otpService.verifyOtp(email, otp);

            if (!verified) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Invalid or expired OTP"
                        ));
            }

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Email verified successfully"
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(Map.of(
                            "message",
                            "OTP verification failed"
                    ));
        }
    }

    @PostMapping("/api/password/forgot/send-otp")
    public ResponseEntity<?> sendPasswordResetOtp(
            @RequestBody Map<String, String> request) {
        String email = request == null ? null : request.get("email");
        if (email == null || !email.trim().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Enter a valid email address"));
        }

        String normalizedEmail = email.trim().toLowerCase();
        try {
            if (userRepository.findByEmail(normalizedEmail) != null) {
                otpService.sendPasswordResetOtp(normalizedEmail);
            }
            return ResponseEntity.ok(Map.of(
                    "message", "If the account exists, a password reset code has been sent."));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(503)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Unable to send a reset code. Please try again."));
        }
    }

    @PostMapping("/api/password/forgot/verify-otp")
    public ResponseEntity<?> verifyPasswordResetOtp(
            @RequestBody Map<String, String> request) {
        String email = request == null ? null : request.get("email");
        String otp = request == null ? null : request.get("otp");
        if (email == null || otp == null || !otp.trim().matches("\\d{6}")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Valid email and six-digit OTP are required."));
        }

        if (!otpService.verifyPasswordResetOtp(email.trim().toLowerCase(), otp.trim())) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Invalid or expired password reset code."));
        }
        return ResponseEntity.ok(Map.of("verified", true));
    }

    @PostMapping("/api/password/forgot/reset")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> request) {
        String email = request == null ? null : request.get("email");
        String password = request == null ? null : request.get("password");
        String otp = request == null ? null : request.get("otp");
        if (email == null || email.isBlank() || otp == null || !otp.trim().matches("\\d{6}")
                || password == null || password.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Email, verified six-digit code, and a password of at least 8 characters are required."));
        }

        String normalizedEmail = email.trim().toLowerCase();
        if (!otpService.verifyPasswordResetOtp(normalizedEmail, otp.trim())) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Verify the password reset code first."));
        }

        User user = userRepository.findByEmail(normalizedEmail);
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password reset could not be completed."));
        }

        user.setPassword(passwordService.encode(password));
        userRepository.save(user);
        otpService.clearPasswordReset(normalizedEmail);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    @PostMapping("/api/signup")
    public ResponseEntity<?> signup(
            @RequestBody User user) {

        try {

            if (user == null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Invalid user details"
                        ));
            }

            if (user.getName() == null ||
                    user.getName().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Name is required"
                        ));
            }

            if (user.getEmail() == null ||
                    user.getEmail().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Email is required"
                        ));
            }

            if (user.getPassword() == null ||
                    user.getPassword().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Password is required"
                        ));
            }

            if (user.getPassword().length() < 8) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Password must contain at least 8 characters."));
            }

            String email = user.getEmail()
                    .trim()
                    .toLowerCase();

            if (!email.matches(
                    "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Enter a valid email address"
                        ));
            }

            if (userRepository.findByEmail(email) != null) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Email already registered"
                        ));
            }

            if (!otpService.isEmailVerified(email)) {

                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "Please verify your email with OTP first"
                        ));
            }

            jwtService.validateConfiguration();
            user.setName(user.getName().trim());
            user.setEmail(email);
            user.setPassword(passwordService.encode(user.getPassword()));
            user.setRole("USER");

            User savedUser =
                    userRepository.save(user);

            otpService.clearVerifiedEmail(email);

            Map<String, Object> userData =
                    new HashMap<>();

            userData.put(
                    "id",
                    savedUser.getId()
            );

            userData.put(
                    "name",
                    savedUser.getName()
            );

            userData.put(
                    "email",
                    savedUser.getEmail()
            );

            userData.put(
                    "role",
                    savedUser.getRole()
            );

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "User registered successfully"
            );

            response.put(
                    "user",
                    userData
            );
            response.put("token", jwtService.createToken(savedUser));

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            return ResponseEntity.status(503)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(Map.of(
                            "message",
                            "Registration failed. Please try again."
                    ));
        }
    }

    @PostMapping("/api/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> loginRequest) {
        return loginForRole(loginRequest, "USER");
    }

    @PostMapping("/api/admin/login")
    public ResponseEntity<?> adminLogin(
            @RequestBody Map<String, String> loginRequest) {
        return loginForRole(loginRequest, "ADMIN");
    }

    @PostMapping("/api/staff/login")
    public ResponseEntity<?> staffLogin(
            @RequestBody Map<String, String> loginRequest) {
        return loginForRole(loginRequest, "HEALTHCARE_STAFF");
    }

    private ResponseEntity<?> loginForRole(
            Map<String, String> loginRequest,
            String expectedRole) {

        try {

            if (loginRequest == null) {

                return ResponseEntity.status(401)
                        .body(Map.of(
                                "message",
                                "Email and password are required"
                        ));
            }

            String email =
                    loginRequest.get("email");

            String password =
                    loginRequest.get("password");

            if (email == null ||
                    email.trim().isEmpty()) {

                return ResponseEntity.status(401)
                        .body(Map.of(
                                "message",
                                "Email is required"
                        ));
            }

            if (password == null ||
                    password.trim().isEmpty()) {

                return ResponseEntity.status(401)
                        .body(Map.of(
                                "message",
                                "Password is required"
                        ));
            }

            email = email.trim().toLowerCase();

            User user =
                    userRepository.findByEmail(email);

            if (user == null) {

                return ResponseEntity.status(401)
                        .body(Map.of(
                                "message",
                                "Invalid email or password"
                        ));
            }

            if (!passwordService.matches(password, user.getPassword())) {

                return ResponseEntity.status(401)
                        .body(Map.of(
                                "message",
                                "Invalid email or password"
                        ));
            }

            if (!passwordService.isEncoded(user.getPassword())) {
                user.setPassword(passwordService.encode(password));
                userRepository.save(user);
            }

            String role = user.getRole();

            if (role == null ||
                    role.trim().isEmpty()) {

                role = "USER";

                user.setRole(role);

                userRepository.save(user);

            } else {

                role = role.trim().toUpperCase();
            }

            if (!expectedRole.equals(role)) {
                return ResponseEntity.status(401)
                        .body(Map.of("message", "Invalid email or password"));
            }

            Map<String, Object> userData =
                    new HashMap<>();

            userData.put(
                    "id",
                    user.getId()
            );

            userData.put(
                    "name",
                    user.getName()
            );

            userData.put(
                    "email",
                    user.getEmail()
            );

            userData.put(
                    "role",
                    role
            );

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "Login successful"
            );

            loginHistoryRepository.save(new LoginHistory(
                    user.getId(),
                    user.getEmail(),
                    role,
                    LocalDateTime.now()));

            response.put(
                    "user",
                    userData
            );
            response.put("token", jwtService.createToken(user));

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            return ResponseEntity.status(503)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(Map.of(
                            "message",
                            "Login failed. Please try again."
                    ));
        }
    }
}