package cl.mastermartini.controller;

import cl.mastermartini.dto.*;
import cl.mastermartini.service.UsuarioService;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UsuarioService usuarios;
  private final AuthenticationManager manager;
  private final SecurityContextRepository repository;

  public AuthController(
      UsuarioService usuarios,
      AuthenticationManager manager,
      SecurityContextRepository repository) {
    this.usuarios = usuarios;
    this.manager = manager;
    this.repository = repository;
  }

  @GetMapping("/csrf")
  public Map<String, String> csrf(CsrfToken token) {
    return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
  }

  @PostMapping("/registro")
  @ResponseStatus(HttpStatus.CREATED)
  public UsuarioResponse registro(@Valid @RequestBody RegistroRequest r) {
    return usuarios.registrar(r);
  }

  @PostMapping("/login")
  public UsuarioResponse login(
      @Valid @RequestBody LoginRequest r,
      HttpServletRequest request,
      HttpServletResponse response) {
    Authentication auth =
        manager.authenticate(
            UsernamePasswordAuthenticationToken.unauthenticated(
                r.email().trim().toLowerCase(java.util.Locale.ROOT), r.password()));
    // Rotar la sesión impide fijación de sesión; invalidar CSRF exige obtener un token nuevo.
    request.getSession();
    request.changeSessionId();
    new HttpSessionCsrfTokenRepository().saveToken(null, request, response);
    var context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(auth);
    SecurityContextHolder.setContext(context);
    repository.saveContext(context, request, response);
    return UsuarioResponse.from(usuarios.obtener(auth.getName()));
  }

  @GetMapping("/me")
  public UsuarioResponse me(Authentication auth) {
    return UsuarioResponse.from(usuarios.obtener(auth.getName()));
  }

  @PostMapping("/password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void cambiarPassword(@Valid @RequestBody CambioPasswordRequest datos,
      Authentication auth, HttpServletRequest request, HttpServletResponse response) {
    usuarios.cambiarPassword(auth.getName(), datos);
    logout(request, response);
  }

  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void logout(HttpServletRequest request, HttpServletResponse response) {
    var session = request.getSession(false);
    if (session != null) session.invalidate();
    SecurityContextHolder.clearContext();
    Cookie cookie = new Cookie("JSESSIONID", "");
    cookie.setPath("/");
    cookie.setHttpOnly(true);
    cookie.setMaxAge(0);
    cookie.setSecure(request.isSecure());
    response.addCookie(cookie);
  }
}
