package vaccination.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Service
public class BrevoEmailService {
    private static final String SEND_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

    private final RestClient restClient;

    @Value("${app.brevo.api-key:}")
    private String apiKey;

    @Value("${app.brevo.sender-email:}")
    private String senderEmail;

    @Value("${app.brevo.sender-name:VaxCare}")
    private String senderName;

    public BrevoEmailService() {
        this.restClient = RestClient.create();
    }

    public void sendTextEmail(String recipient, String subject, String text) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("BREVO_API_KEY is not configured on the backend.");
        }
        if (senderEmail == null || senderEmail.isBlank()) {
            throw new IllegalStateException("BREVO_SENDER_EMAIL is not configured on the backend.");
        }

        Map<String, Object> message = Map.of(
                "sender", Map.of("name", senderName, "email", senderEmail),
                "to", List.of(Map.of("email", recipient)),
                "subject", subject,
                "textContent", text);

        try {
            restClient.post()
                    .uri(SEND_EMAIL_URL)
                    .header("api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(message)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            throw new IllegalStateException(
                    "Brevo rejected the email request (HTTP "
                            + ex.getStatusCode().value() + "). Check the API key and verified sender.",
                    ex);
        } catch (RestClientException ex) {
            throw new IllegalStateException("Could not connect to the Brevo email API.", ex);
        }
    }
}
