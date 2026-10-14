package vaccination.service;

import vaccination.entity.EmailOtp;
import vaccination.entity.EmailOtp.Purpose;
import vaccination.repository.EmailOtpRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Locale;

@Service
public class OtpService {
    private static final SecureRandom RANDOM = new SecureRandom();

    private final EmailOtpRepository otpRepository;
    private final BrevoEmailService emailService;

    @Value("${app.otp.hmac-secret}")
    private String hmacSecret;

    @Value("${app.otp.ttl-minutes:5}")
    private int ttlMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.resend-wait-seconds:60}")
    private int resendWaitSeconds;

    public OtpService(EmailOtpRepository otpRepository, BrevoEmailService emailService) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void sendOtp(String email) {
        sendOtp(email, Purpose.SIGNUP);
    }

    @Transactional
    public void sendPasswordResetOtp(String email) {
        sendOtp(email, Purpose.PASSWORD_RESET);
    }

    private void sendOtp(String email, Purpose purpose) {
        String normalizedEmail = normalizeEmail(email);
        LocalDateTime now = LocalDateTime.now();
        EmailOtp entry = otpRepository.findByEmail(normalizedEmail)
                .orElseGet(EmailOtp::new);

        if (entry.getLastSentAt() != null
                && entry.getLastSentAt().plusSeconds(resendWaitSeconds).isAfter(now)) {
            throw new IllegalStateException("Please wait before requesting another OTP.");
        }

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        String otpHash = hashOtp(otp);
        String subject = purpose == Purpose.PASSWORD_RESET
                ? "VaxCare Password Reset OTP"
                : "VaxCare Email Verification OTP";
        String purposeText = purpose == Purpose.PASSWORD_RESET
                ? "reset your password"
                : "verify your email";
        emailService.sendTextEmail(
                normalizedEmail,
                subject,
                "Your VaxCare code to " + purposeText + " is " + otp
                        + ". It expires in " + ttlMinutes + " minutes. Do not share this code.");

        entry.setEmail(normalizedEmail);
        entry.setOtpHash(otpHash);
        entry.setExpiresAt(now.plusMinutes(ttlMinutes));
        entry.setLastSentAt(now);
        entry.setAttempts(0);
        entry.setVerified(false);
        entry.setPurpose(purpose);
        otpRepository.save(entry);
    }

    @Transactional
    public boolean verifyOtp(String email, String otp) {
        return verifyOtp(email, otp, Purpose.SIGNUP);
    }

    @Transactional
    public boolean verifyPasswordResetOtp(String email, String otp) {
        return verifyOtp(email, otp, Purpose.PASSWORD_RESET);
    }

    private boolean verifyOtp(String email, String otp, Purpose purpose) {
        if (email == null || otp == null || !otp.matches("\\d{6}")) {
            return false;
        }

        EmailOtp entry = otpRepository.findByEmail(normalizeEmail(email)).orElse(null);
        if (entry == null) return false;
        if (!hasPurpose(entry, purpose)) return false;

        LocalDateTime now = LocalDateTime.now();
        if (entry.getExpiresAt() == null
                || entry.getExpiresAt().isBefore(now)
                || entry.getAttempts() >= maxAttempts) {
            return false;
        }
        if (entry.isVerified()) return true;

        entry.setAttempts(entry.getAttempts() + 1);
        boolean matches = MessageDigest.isEqual(
                hashOtp(otp).getBytes(StandardCharsets.UTF_8),
                entry.getOtpHash().getBytes(StandardCharsets.UTF_8));
        if (matches) entry.setVerified(true);
        otpRepository.save(entry);
        return matches;
    }

    @Transactional
    public boolean isEmailVerified(String email) {
        return isEmailVerified(email, Purpose.SIGNUP);
    }

    private boolean isEmailVerified(String email, Purpose purpose) {
        if (email == null || email.isBlank()) return false;
        return otpRepository.findByEmail(normalizeEmail(email))
            .map(entry -> entry.isVerified()
                    && hasPurpose(entry, purpose)
                    && entry.getExpiresAt() != null
                    && !entry.getExpiresAt().isBefore(LocalDateTime.now()))
                .orElse(false);
    }

    @Transactional
    public void clearVerifiedEmail(String email) {
        clearVerifiedEmail(email, Purpose.SIGNUP);
    }

    @Transactional
    public void clearPasswordReset(String email) {
        clearVerifiedEmail(email, Purpose.PASSWORD_RESET);
    }

    private void clearVerifiedEmail(String email, Purpose purpose) {
        if (email == null || email.isBlank()) return;
        otpRepository.findByEmail(normalizeEmail(email))
                .filter(entry -> hasPurpose(entry, purpose))
                .ifPresent(otpRepository::delete);
    }

    private boolean hasPurpose(EmailOtp entry, Purpose purpose) {
        return entry.getPurpose() == purpose
                || (entry.getPurpose() == null && purpose == Purpose.SIGNUP);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String hashOtp(String otp) {
        if (hmacSecret == null || hmacSecret.isBlank()) {
            throw new IllegalStateException("OTP_HMAC_SECRET is not configured.");
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    hmacSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getEncoder().encodeToString(
                    mac.doFinal(otp.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Could not process OTP.", ex);
        }
    }
}