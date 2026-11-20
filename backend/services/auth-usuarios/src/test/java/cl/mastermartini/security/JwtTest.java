package cl.mastermartini.security;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import cl.mastermartini.model.Usuario;
import cl.mastermartini.repository.UsuarioRepository;
import java.time.*;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.*;

@WebMvcTest(controllers = JwtTest.Probe.class, properties = {
    "app.frontend-origin=http://127.0.0.1:5173",
    "app.jwt-secret=" + JwtTest.SECRETO})
@Import({SecurityConfig.class, TokenService.class, JwtTest.Probe.class})
class JwtTest {
  static final String SECRETO = "secreto-de-pruebas-con-mas-de-32-caracteres";
  @Autowired MockMvc mvc;
  @Autowired TokenService tokens;
  @MockitoBean UsuarioRepository usuarios;

  @RestController
  static class Probe {
    @GetMapping("/api/admin/probe") String admin(Authentication a) { return a.getName(); }
    @PostMapping("/api/admin/probe") String write() { return "ok"; }
    @GetMapping("/api/probe") String cliente(Authentication a) { return a.getName(); }
  }

  private Usuario usuario(String email, String rol, String hash) {
    var u = new Usuario();
    u.setEmail(email);
    u.setRol(rol);
    u.setPasswordHash(hash);
    when(usuarios.findByEmail(email)).thenReturn(Optional.of(u));
    return u;
  }

  private String bearer(Usuario u) {
    return "Bearer " + tokens.emitir(u.getEmail(), u.getRol(), u.getPasswordHash());
  }

  @Test void adminConTokenLeeYEscribeSinCsrf() throws Exception {
    var u = usuario("admin@test.cl", "ADMINISTRADOR", "$2a$12$hash");
    mvc.perform(get("/api/admin/probe").header("Authorization", bearer(u)))
        .andExpect(status().isOk()).andExpect(content().string("admin@test.cl"));
    mvc.perform(post("/api/admin/probe").header("Authorization", bearer(u))).andExpect(status().isOk());
  }

  @Test void clienteConTokenNoEntraAAdmin() throws Exception {
    var u = usuario("cliente@test.cl", "CLIENTE", "$2a$12$hash");
    mvc.perform(get("/api/probe").header("Authorization", bearer(u))).andExpect(status().isOk());
    mvc.perform(get("/api/admin/probe").header("Authorization", bearer(u))).andExpect(status().isForbidden());
  }

  @Test void elRolSeLeeDeLaBaseDeDatos() throws Exception {
    var u = usuario("ex@test.cl", "ADMINISTRADOR", "$2a$12$hash");
    String token = bearer(u);
    u.setRol("CLIENTE");
    mvc.perform(get("/api/admin/probe").header("Authorization", token)).andExpect(status().isForbidden());
  }

  @Test void cambiarPasswordRevocaElToken() throws Exception {
    var u = usuario("c@test.cl", "CLIENTE", "$2a$12$viejo");
    String token = bearer(u);
    u.setPasswordHash("$2a$12$nuevo");
    mvc.perform(get("/api/probe").header("Authorization", token)).andExpect(status().isUnauthorized());
  }

  @Test void tokenAlteradoOAjenoSeRechaza() throws Exception {
    var u = usuario("c@test.cl", "CLIENTE", "$2a$12$hash");
    mvc.perform(get("/api/probe").header("Authorization", bearer(u) + "x")).andExpect(status().isUnauthorized());
    var otro = new TokenService("otro-secreto-distinto-con-mas-de-32-caracteres", 60);
    mvc.perform(get("/api/probe").header("Authorization",
            "Bearer " + otro.emitir(u.getEmail(), "ADMINISTRADOR", u.getPasswordHash())))
        .andExpect(status().isUnauthorized());
  }

  @Test void tokenVencidoSeRechaza() throws Exception {
    var u = usuario("c@test.cl", "CLIENTE", "$2a$12$hash");
    var pasado = new TokenService(SECRETO, 5, Clock.fixed(Instant.now().minus(Duration.ofHours(2)), ZoneOffset.UTC));
    mvc.perform(get("/api/probe").header("Authorization",
            "Bearer " + pasado.emitir(u.getEmail(), "CLIENTE", u.getPasswordHash())))
        .andExpect(status().isUnauthorized());
  }

  @Test void usuarioBorradoNoEntra() throws Exception {
    var u = usuario("borrado@test.cl", "CLIENTE", "$2a$12$hash");
    String token = bearer(u);
    when(usuarios.findByEmail("borrado@test.cl")).thenReturn(Optional.empty());
    mvc.perform(get("/api/probe").header("Authorization", token)).andExpect(status().isUnauthorized());
  }

  @Test void sinTokenNiSesionNoEntra() throws Exception {
    mvc.perform(get("/api/probe")).andExpect(status().isUnauthorized());
  }

  @Test void secretoCortoNoSeAcepta() {
    assertThrows(IllegalArgumentException.class, () -> new TokenService("corto", 60));
  }
}
