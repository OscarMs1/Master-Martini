package cl.mastermartini.security;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import cl.mastermartini.controller.AuthController;
import cl.mastermartini.model.Usuario;
import cl.mastermartini.repository.UsuarioRepository;
import cl.mastermartini.service.UsuarioService;
import jakarta.servlet.http.Cookie;
import java.util.Optional;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = AuthController.class, properties = {
    "app.frontend-origin=http://localhost:8095",
    "app.cookie-secure=true",
    "app.jwt-secret=secreto-de-pruebas-con-mas-de-32-caracteres"})
@Import({SecurityConfig.class, TokenService.class})
class AuthWebTest {
  static final String ORIGEN = "http://localhost:8095";
  static final String LOGIN = "{\"email\":\"cliente@test.cl\",\"password\":\"clave12345\"}";
  static final String VALOR = "A".repeat(43);
  static final String NUEVO = "B".repeat(43);
  static final String HASH = new BCryptPasswordEncoder(4).encode("clave12345");
  @Autowired MockMvc mvc;
  @MockitoBean UsuarioRepository repo;
  @MockitoBean UsuarioService usuarios;
  @MockitoBean RefreshTokenService refresh;

  @BeforeEach
  void preparar() {
    var u = new Usuario();
    u.setEmail("cliente@test.cl");
    u.setNombre("Cliente");
    u.setRol("CLIENTE");
    u.setPasswordHash(HASH);
    when(repo.findByEmail("cliente@test.cl")).thenReturn(Optional.of(u));
    when(usuarios.obtener("cliente@test.cl")).thenReturn(u);
    when(refresh.emitir(anyString())).thenReturn(VALOR);
    when(refresh.duracion()).thenReturn(java.time.Duration.ofDays(7));
    when(refresh.rotar(VALOR)).thenReturn(Optional.of(new RefreshTokenService.Rotado("cliente@test.cl", NUEVO)));
  }

  @Test void loginWebEntregaTokenYCookieSegura() throws Exception {
    mvc.perform(post("/api/v1/auth/login").header("Origin", ORIGEN).contentType(MediaType.APPLICATION_JSON).content(LOGIN))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").isNotEmpty())
        .andExpect(jsonPath("$.refreshToken").doesNotExist())
        .andExpect(jsonPath("$.usuario.email").value("cliente@test.cl"))
        .andExpect(header().string("Set-Cookie", allOf(org.hamcrest.Matchers.startsWith("mm_refresh=" + VALOR), containsString("HttpOnly"),
            containsString("Secure"), containsString("SameSite=Strict"), containsString("Path=/api/v1/auth"))));
  }

  @Test void loginDesdeOtroSitioSeRechaza() throws Exception {
    mvc.perform(post("/api/v1/auth/login").header("Origin", "https://evil.example").contentType(MediaType.APPLICATION_JSON).content(LOGIN))
        .andExpect(status().isForbidden());
    mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content(LOGIN))
        .andExpect(status().isForbidden());
  }

  @Test void renovarConCookieRotaLaCookie() throws Exception {
    mvc.perform(post("/api/v1/auth/refresh").header("Origin", ORIGEN).cookie(new Cookie("mm_refresh", VALOR)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").isNotEmpty())
        .andExpect(jsonPath("$.refreshToken").doesNotExist())
        .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.startsWith("mm_refresh=" + NUEVO)));
  }

  @Test void renovarConCookieDesdeOtroSitioSeRechaza() throws Exception {
    mvc.perform(post("/api/v1/auth/refresh").header("Origin", "https://evil.example").cookie(new Cookie("mm_refresh", VALOR)))
        .andExpect(status().isForbidden());
    verify(refresh, never()).rotar(anyString());
  }

  @Test void cookieInvalidaSeBorra() throws Exception {
    mvc.perform(post("/api/v1/auth/refresh").header("Origin", ORIGEN).cookie(new Cookie("mm_refresh", "C".repeat(43))))
        .andExpect(status().isUnauthorized())
        .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));
  }

  @Test void appMovilUsaElCuerpoSinCookies() throws Exception {
    mvc.perform(post("/api/v1/auth/token").contentType(MediaType.APPLICATION_JSON).content(LOGIN))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.refreshToken").value(VALOR))
        .andExpect(header().doesNotExist("Set-Cookie"));
    mvc.perform(post("/api/v1/auth/refresh").contentType(MediaType.APPLICATION_JSON).content("{\"refreshToken\":\"" + VALOR + "\"}"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.refreshToken").value(NUEVO));
  }

  @Test void logoutRevocaYBorraLaCookie() throws Exception {
    mvc.perform(post("/api/v1/auth/logout").header("Origin", ORIGEN).cookie(new Cookie("mm_refresh", VALOR)))
        .andExpect(status().isNoContent())
        .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));
    verify(refresh).revocar(VALOR);
  }
}
