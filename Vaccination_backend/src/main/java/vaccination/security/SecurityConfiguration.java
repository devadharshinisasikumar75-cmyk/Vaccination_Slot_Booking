package vaccination.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write("{\"message\":\"Authentication is required.\"}");
                        })
                        .accessDeniedHandler((request, response, exception) -> {
                            response.setStatus(403);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.getWriter().write("{\"message\":\"You are not allowed to perform this action.\"}");
                        }))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/", "/error", "/favicon.ico",
                                "/api/otp/**", "/api/auth/**",
                                "/api/password/forgot/**",
                                "/api/signup", "/api/login",
                                "/api/admin/login", "/api/staff/login").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/staff/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/catalog/**")
                                .hasAnyRole("ADMIN", "HEALTHCARE_STAFF", "USER")
                        .requestMatchers("/api/catalog/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users")
                                .hasAnyRole("ADMIN", "HEALTHCARE_STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/slots")
                                .hasAnyRole("ADMIN", "HEALTHCARE_STAFF")
                        .requestMatchers("/api/slots/**")
                                .hasAnyRole("ADMIN", "HEALTHCARE_STAFF", "USER")
                        .requestMatchers("/api/healthcare/**", "/api/reports/**")
                                .hasAnyRole("ADMIN", "HEALTHCARE_STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/*/status")
                                .hasAnyRole("ADMIN", "HEALTHCARE_STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/bookings")
                                .hasRole("USER")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
