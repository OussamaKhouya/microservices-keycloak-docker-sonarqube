package com.tp.productservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // H2 Console - for development only
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()

                        // Product endpoints
                        // GET requests - accessible by ADMIN and CLIENT
                        .requestMatchers(HttpMethod.GET, "/api/products/**").hasAnyRole("ADMIN", "CLIENT")

                        // POST, PUT, DELETE - only ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        // All other requests require authentication
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
                // Allow H2 console frames
                .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakRoleConverter());
        return converter;
    }

    @Bean
    public JwtDecoder jwtDecoder(
            @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:http://localhost:8080/realms/microservices-realm/protocol/openid-connect/certs}") String jwkSetUri,
            @Value("${app.security.allowed-issuers:http://localhost:8080/realms/microservices-realm,http://keycloak:8080/realms/microservices-realm}") String allowedIssuers) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

        OAuth2TokenValidator<Jwt> withTimestamp = JwtValidators.createDefault();
        OAuth2TokenValidator<Jwt> issuerValidator = new AllowedIssuersValidator(parseAllowedIssuers(allowedIssuers));

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withTimestamp, issuerValidator));
        return decoder;
    }

    // Custom converter to extract roles from Keycloak JWT
    static class KeycloakRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
        @Override
        public Collection<GrantedAuthority> convert(Jwt jwt) {
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess == null || realmAccess.isEmpty()) {
                return List.of();
            }

            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) realmAccess.get("roles");
            if (roles == null) {
                return List.of();
            }

            return roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .collect(Collectors.toList());
        }
    }

    // Custom validator to accept tokens issued for localhost (external) or keycloak (inside Docker)
    static class AllowedIssuersValidator implements OAuth2TokenValidator<Jwt> {
        private final Set<String> allowedIssuers;

        AllowedIssuersValidator(Set<String> allowedIssuers) {
            this.allowedIssuers = allowedIssuers;
        }

        @Override
        public OAuth2TokenValidatorResult validate(Jwt token) {
            String issuer = token.getIssuer() != null ? token.getIssuer().toString() : null;
            if (issuer != null && allowedIssuers.contains(issuer)) {
                return OAuth2TokenValidatorResult.success();
            }
            OAuth2Error error = new OAuth2Error("invalid_token", "The iss claim is not allowed", null);
            return OAuth2TokenValidatorResult.failure(error);
        }
    }

    private Set<String> parseAllowedIssuers(String allowedIssuers) {
        return Arrays.stream(allowedIssuers.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }
}
