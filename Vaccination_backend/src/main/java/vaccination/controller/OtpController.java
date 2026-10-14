package vaccination.controller;

import vaccination.service.OtpService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class OtpController {
    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "A valid email is required."));
        }

        try {
            otpService.sendOtp(email);
            return ResponseEntity.ok(Map.of("message", "OTP sent."));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null || !otp.matches("\\d{6}")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Valid email and six-digit OTP are required."));
        }

        boolean valid = otpService.verifyOtp(email, otp);
        return valid
                ? ResponseEntity.ok(Map.of("verified", true))
                : ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("verified", false, "message", "Invalid or expired OTP."));
    }
}