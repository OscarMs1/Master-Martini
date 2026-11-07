package cl.mastermartini.security;
import cl.mastermartini.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
@WebMvcTest(controllers=SeguridadTest.Probe.class,properties="app.frontend-origin=http://127.0.0.1:5173")
@Import({SecurityConfig.class,SeguridadTest.Probe.class})
class SeguridadTest {
 @Autowired MockMvc mvc;
 @MockitoBean UsuarioRepository usuarios;
 @RestController static class Probe {
  @GetMapping("/api/admin/probe") String admin(){return "ok";}
  @PostMapping("/api/admin/probe") String write(){return "ok";}
 }
 @Test void anonimoNoAccede() throws Exception {mvc.perform(get("/api/admin/probe")).andExpect(status().isUnauthorized());}
 @Test void clienteNoAdmin() throws Exception {mvc.perform(get("/api/admin/probe").with(user("cliente").roles("CLIENTE"))).andExpect(status().isForbidden());}
 @Test void adminConCsrfPuedeEscribir() throws Exception {mvc.perform(post("/api/admin/probe").with(user("admin").roles("ADMINISTRADOR")).with(csrf())).andExpect(status().isOk());}
 @Test void adminSinCsrfNoPuedeEscribir() throws Exception {mvc.perform(post("/api/admin/probe").with(user("admin").roles("ADMINISTRADOR"))).andExpect(status().isForbidden());}
}
