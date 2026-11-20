package cl.mastermartini.controller;

import cl.mastermartini.dto.*;
import cl.mastermartini.model.Usuario;
import cl.mastermartini.security.*;
import cl.mastermartini.service.UsuarioService;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Autenticación con JWT.
 *
 * <ul>
 *   <li>Web: el access token (corto) se entrega en el cuerpo y la página lo guarda solo en memoria.
 *       El token de renovación va en una cookie HttpOnly + SameSite=Strict limitada a /api/auth, que
 *       JavaScript no puede leer. Las rutas que usan esa cookie exigen un Origin permitido.
 *   <li>App móvil: /api/auth/token entrega ambos tokens en el cuerpo y no usa cookies.
 * </ul>
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  public static final String COOKIE = "mm_refresh";
  private static final String RUTA_COOKIE = "/api/auth";
  private final UsuarioService usuarios;
  private final AuthenticationManager manager;
  private final TokenService tokens;
  private final RefreshTokenService refresh;
  private final Set<String> origenes;
  private final boolean cookieSegura;

  public AuthController(
      UsuarioService usuarios,
      AuthenticationManager manager,
      TokenService tokens,
      RefreshTokenService refresh,
      @Value("${app.frontend-origin}") String origenes,
      @Value("${app.cookie-secure:false}") boolean cookieSegura) {
    this.usuarios = usuarios;
    this.manager = manager;
    this.tokens = tokens;
    this.refresh = refresh;
    this.origenes = Set.copyOf(Arrays.stream(origenes.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList());
    this.cookieSegura = cookieSegura;
  }

  public record RefreshRequest(String refreshToken) {}

  @PostMapping("/registro")
  @ResponseStatus(HttpStatus.CREATED)
  public UsuarioResponse registro(@Valid @RequestBody RegistroRequest r) {
    return usuarios.registrar(r);
  }

  /** Login de la página web: token en el cuerpo y renovación en cookie HttpOnly. */
  @PostMapping("/login")
  public TokenResponse login(
      @Valid @RequestBody LoginRequest r, HttpServletRequest request, HttpServletResponse response) {
    exigirOrigen(request);
    Usuario u = autenticar(r);
    ponerCookie(response, refresh.emitir(u.getEmail()));
    return respuesta(u, null);
  }

  /** Login de la app móvil: ambos tokens en el cuerpo, sin cookies. */
  @PostMapping("/token")
  public TokenResponse token(@Valid @RequestBody LoginRequest r) {
    Usuario u = autenticar(r);
    return respuesta(u, refresh.emitir(u.getEmail()));
  }

  /**
   * Entrega un access token nuevo. La web envía la cookie; la app envía {"refreshToken": "..."}.
   * El token de renovación usado queda gastado y se entrega uno nuevo.
   */
  @PostMapping("/refresh")
  public TokenResponse renovar(
      @RequestBody(required = false) RefreshRequest body,
      HttpServletRequest request,
      HttpServletResponse response) {
    String cookie = leerCookie(request);
    boolean web = cookie != null;
    if (web) exigirOrigen(request);
    String valor = web ? cookie : body == null ? null : body.refreshToken();
    var rotado = refresh.rotar(valor);
    if (rotado.isEmpty()) {
      if (web) borrarCookie(response);
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión para continuar.");
    }
    Usuario u = usuarios.obtener(rotado.get().email());
    if (web) {
      ponerCookie(response, rotado.get().valor());
      return respuesta(u, null);
    }
    return respuesta(u, rotado.get().valor());
  }

  @GetMapping("/me")
  public UsuarioResponse me(Authentication auth) {
    return UsuarioResponse.from(usuarios.obtener(auth.getName()));
  }

  /** Cambia la contraseña y cierra todas las sesiones del usuario (también los JWT ya emitidos). */
  @PostMapping("/password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void cambiarPassword(
      @Valid @RequestBody CambioPasswordRequest datos, Authentication auth, HttpServletResponse response) {
    usuarios.cambiarPassword(auth.getName(), datos);
    refresh.revocarUsuario(auth.getName());
    borrarCookie(response);
  }

  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void logout(
      @RequestBody(required = false) RefreshRequest body,
      HttpServletRequest request,
      HttpServletResponse response) {
    String cookie = leerCookie(request);
    if (cookie != null) {
      exigirOrigen(request);
      refresh.revocar(cookie);
    } else if (body != null) {
      refresh.revocar(body.refreshToken());
    }
    borrarCookie(response);
  }

  private Usuario autenticar(LoginRequest r) {
    Authentication auth =
        manager.authenticate(
            UsernamePasswordAuthenticationToken.unauthenticated(
                r.email().trim().toLowerCase(Locale.ROOT), r.password()));
    return usuarios.obtener(auth.getName());
  }

  private TokenResponse respuesta(Usuario u, String refreshToken) {
    return new TokenResponse(
        tokens.emitir(u.getEmail(), u.getRol(), u.getPasswordHash()),
        "Bearer",
        tokens.segundos(),
        refreshToken,
        UsuarioResponse.from(u));
  }

  /**
   * Protección CSRF de las rutas que usan la cookie: además de SameSite=Strict, el navegador
   * debe declarar que la petición viene de nuestra propia página.
   */
  private void exigirOrigen(HttpServletRequest request) {
    String origen = request.getHeader("Origin");
    if (origen == null || !origenes.contains(origen))
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Origen no permitido.");
  }

  private static String leerCookie(HttpServletRequest request) {
    if (request.getCookies() == null) return null;
    for (Cookie c : request.getCookies()) if (COOKIE.equals(c.getName()) && !c.getValue().isBlank()) return c.getValue();
    return null;
  }

  private void ponerCookie(HttpServletResponse response, String valor) {
    response.addHeader(HttpHeaders.SET_COOKIE, cookie(valor, refresh.duracion()).toString());
  }

  private void borrarCookie(HttpServletResponse response) {
    response.addHeader(HttpHeaders.SET_COOKIE, cookie("", java.time.Duration.ZERO).toString());
  }

  private ResponseCookie cookie(String valor, java.time.Duration duracion) {
    return ResponseCookie.from(COOKIE, valor)
        .httpOnly(true)
        .secure(cookieSegura)
        .sameSite("Strict")
        .path(RUTA_COOKIE)
        .maxAge(duracion)
        .build();
  }
}
