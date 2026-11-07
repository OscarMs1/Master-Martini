package cl.mastermartini.security;
import org.junit.jupiter.api.Test;import org.springframework.beans.factory.annotation.Autowired;import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;import org.springframework.context.annotation.Import;import org.springframework.test.web.servlet.MockMvc;import org.springframework.web.bind.annotation.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@WebMvcTest(controllers=InternalSecurityTest.Probe.class,properties={"app.domain=true","app.service-key=clave-interna-exclusiva-para-pruebas-2026"})
@Import({InternalSecurity.class,InternalSecurityTest.Probe.class})class InternalSecurityTest{
 @Autowired MockMvc mvc;
 @RestController static class Probe{@GetMapping("/api/admin/probe")String admin(){return "ok";}@GetMapping("/api/productos")String catalog(){return "ok";}}
 @Test void identidadFalsificadaSinClaveNoSirve()throws Exception{mvc.perform(get("/api/admin/probe").header("X-User-Role","ADMINISTRADOR").header("X-User-Id","1")).andExpect(status().isUnauthorized());}
 @Test void claveInternaNoConvierteClienteEnAdmin()throws Exception{mvc.perform(get("/api/admin/probe").header("X-Service-Key","clave-interna-exclusiva-para-pruebas-2026").header("X-User-Id","2").header("X-User-Role","CLIENTE")).andExpect(status().isForbidden());}
 @Test void lecturaPublicaSoloMedianteGateway()throws Exception{mvc.perform(get("/api/productos").header("X-Service-Key","clave-interna-exclusiva-para-pruebas-2026")).andExpect(status().isOk());}
}
