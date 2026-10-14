package vaccination;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import vaccination.security.JwtService;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
		"app.jwt.secret=this-is-a-test-jwt-signing-secret-with-at-least-thirty-two-bytes",
		"app.jwt.expiration-hours=12"
})
@AutoConfigureMockMvc
class VaccinationApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JwtService jwtService;

	@Test
	void contextLoads() {
	}

	@Test
	void apiRequiresAuthenticationAndChecksRolesAndUserOwnership() throws Exception {
		mockMvc.perform(get("/api/users"))
				.andExpect(status().isUnauthorized());
		mockMvc.perform(get("/api/users")
						.header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token"))
				.andExpect(status().isUnauthorized());

		String userToken = jwtService.createToken(7L, "user@example.com", "USER");
		mockMvc.perform(get("/api/users")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken))
				.andExpect(status().isForbidden());
		mockMvc.perform(get("/api/bookings/8")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + userToken))
				.andExpect(status().isForbidden());

		String adminToken = jwtService.createToken(1L, "admin@example.com", "ADMIN");
		mockMvc.perform(get("/api/users")
						.header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken))
				.andExpect(status().isOk());
	}
}
