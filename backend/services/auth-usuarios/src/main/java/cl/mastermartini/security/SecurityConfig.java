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
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.core.convert.converter.Converter;
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
  JwtDecoder jwtDecoder(TokenService tokens) {
    return tokens.decoder();
  }

  /**
   * Convierte un JWT válido en usuario autenticado. El rol se lee de la base de datos (no del
   * token) y el token deja de valer si el usuario se borra o cambia la contraseña.
   */
  static Converter<Jwt, JwtAuthenticationToken> jwtConverter(UserDetailsService details, TokenService tokens) {
    return jwt -> {
      UserDetails u = details.loadUserByUsername(jwt.getSubject());
      if (!tokens.versionPassword(u.getPassword()).equals(jwt.getClaimAsString("pwv")))
        throw new BadCredentialsException("Token revocado.");
      return new JwtAuthenticationToken(jwt, u.getAuthorities(), u.getUsername());
    };
  }

  private static final AuthenticationEntryPoint NO_AUTENTICADO =
      (req, res, ex) -> {
        res.setStatus(401);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"message\":\"Inicia sesión para continuar.\"}");
      };

  @Bean
  SecurityFilterChain filterChain(
      HttpSecurity http,
      UserDetailsService details,
      TokenService tokens)
      throws Exception {
    http.cors(cors -> {})
        // Sin sesiones: cada petición se autentica con "Authorization: Bearer", que el navegador
        // nunca agrega solo, así que un sitio ajeno no puede falsificarla (no hace falta token CSRF).
        // La única cookie (renovación) es SameSite=Strict y AuthController exige un Origin permitido.
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .oauth2ResourceServer(o -> o
            .authenticationEntryPoint(NO_AUTENTICADO)
            .jwt(j -> j.jwtAuthenticationConverter(jwtConverter(details, tokens))))
        .authorizeHttpRequests(
            a ->
                a.requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .requestMatchers(
                        "/api/v1/estado", "/api/v1/auth/registro", "/api/v1/auth/login", "/api/v1/auth/token", "/api/v1/auth/refresh", "/api/v1/auth/logout", "/error")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs", "/v3/api-docs/**", "/v3/servicios/*")
                    .permitAll()
                    .requestMatchers(
                        HttpMethod.GET, "/api/v1/productos", "/api/v1/productos/*", "/api/v1/clases", "/api/v1/imagenes/*", "/api/v1/videos/*", "/api/imagenes/*", "/api/videos/*", "/api/v1/novedades", "/api/v1/novedades/*")
                    .permitAll()
                    // Las reseñas se pueden leer sin cuenta; escribir exige sesión y CSRF.
                    .requestMatchers(HttpMethod.GET, "/api/v1/resenas/producto/*").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/pedidos", "/api/v1/contactos", "/api/v1/asistente")
                    .permitAll()
                    .requestMatchers("/api/v1/admin/**")
                    .hasRole("ADMINISTRADOR")
                    .requestMatchers(HttpMethod.POST, "/api/v1/productos")
                    .hasRole("ADMINISTRADOR")
                    .requestMatchers(HttpMethod.PUT, "/api/v1/productos/*")
                    .hasRole("ADMINISTRADOR")
                    .requestMatchers(HttpMethod.DELETE, "/api/v1/productos/*")
                    .hasRole("ADMINISTRADOR")
                    .anyRequest()
                    .authenticated())
        .exceptionHandling(
            e ->
                e.authenticationEntryPoint(NO_AUTENTICADO)
                    .accessDeniedHandler(
                        (req, res, ex) -> {
                          res.setStatus(403);
                          res.setContentType("application/json;charset=UTF-8");
                          res.getWriter()
                              .write(
                                  "{\"message\":\"No tienes permiso para realizar esta acción.\"}");
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
    c.setAllowedHeaders(List.of("Content-Type", "Authorization"));
    c.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/v1/**", c);
    return source;
  }
}
