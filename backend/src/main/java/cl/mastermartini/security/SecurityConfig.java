package cl.mastermartini.security;

import cl.mastermartini.repository.UsuarioRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.*;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.*;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  UserDetailsService userDetailsService(UsuarioRepository usuarios) {
    return email ->
        usuarios
            .findByEmail(email)
            .map(
                u ->
                    User.withUsername(u.getEmail())
                        .password(u.getPasswordHash())
                        .roles(u.getRol())
                        .build())
            .orElseThrow(() -> new UsernameNotFoundException("Credenciales incorrectas."));
  }

  @Bean
  AuthenticationManager authenticationManager(UserDetailsService details, PasswordEncoder encoder) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider(details);
    provider.setPasswordEncoder(encoder);
    return new ProviderManager(provider);
  }

  @Bean
  SecurityContextRepository contextRepository() {
    return new HttpSessionSecurityContextRepository();
  }

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http, SecurityContextRepository repository)
      throws Exception {
    http.cors(cors -> {})
        .csrf(csrf -> csrf.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
        .securityContext(c -> c.securityContextRepository(repository))
        .authorizeHttpRequests(
            a ->
                a.requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers(
                        "/api/auth/csrf", "/api/auth/registro", "/api/auth/login", "/error")
                    .permitAll()
                    .requestMatchers(
                        HttpMethod.GET, "/api/productos", "/api/productos/*", "/api/clases", "/api/imagenes/*", "/api/novedades", "/api/novedades/*")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/pedidos", "/api/contactos")
                    .permitAll()
                    .requestMatchers("/api/admin/**")
                    .hasRole("ADMINISTRADOR")
                    .requestMatchers(HttpMethod.POST, "/api/productos")
                    .hasRole("ADMINISTRADOR")
                    .requestMatchers(HttpMethod.PUT, "/api/productos/*")
                    .hasRole("ADMINISTRADOR")
                    .requestMatchers(HttpMethod.DELETE, "/api/productos/*")
                    .hasRole("ADMINISTRADOR")
                    .anyRequest()
                    .authenticated())
        .exceptionHandling(
            e ->
                e.authenticationEntryPoint(
                        (req, res, ex) -> {
                          res.setStatus(401);
                          res.setContentType("application/json;charset=UTF-8");
                          res.getWriter().write("{\"message\":\"Inicia sesión para continuar.\"}");
                        })
                    .accessDeniedHandler(
                        (req, res, ex) -> {
                          res.setStatus(403);
                          res.setContentType("application/json;charset=UTF-8");
                          res.getWriter()
                              .write(
                                  "{\"message\":\"No tienes permiso o la sesión de seguridad"
                                      + " expiró. Recarga la página.\"}");
                        }))
        .logout(logout -> logout.disable())
        .requestCache(cache -> cache.disable());
    return http.build();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource(@Value("${app.frontend-origin}") String origin) {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(java.util.Arrays.stream(origin.split(",")).map(String::trim).toList());
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    c.setAllowedHeaders(List.of("Content-Type", "X-CSRF-TOKEN"));
    c.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", c);
    return source;
  }
}
