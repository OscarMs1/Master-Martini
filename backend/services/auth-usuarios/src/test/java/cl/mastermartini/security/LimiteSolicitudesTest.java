package cl.mastermartini.security;

import static org.junit.jupiter.api.Assertions.*;

import java.time.*;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;

class LimiteSolicitudesTest {
  Instant ahora = Instant.parse("2026-11-20T12:00:00Z");
  final Clock reloj = new Clock() {
    public ZoneId getZone() { return ZoneOffset.UTC; }
    public Clock withZone(ZoneId z) { return this; }
    public Instant instant() { return ahora; }
  };

  @Test void bloqueaAlSuperarElMaximoYSeLiberaAlTerminarLaVentana() {
    var limite = new LimiteSolicitudes(new IpCliente(0), reloj);
    for (int i = 0; i < 3; i++) assertEquals(0, limite.consumir("login|1.2.3.4", 3, Duration.ofMinutes(5)));
    assertTrue(limite.consumir("login|1.2.3.4", 3, Duration.ofMinutes(5)) > 0);
    assertEquals(0, limite.consumir("login|5.6.7.8", 3, Duration.ofMinutes(5)), "otra IP no se ve afectada");
    ahora = ahora.plus(Duration.ofMinutes(5));
    assertEquals(0, limite.consumir("login|1.2.3.4", 3, Duration.ofMinutes(5)));
  }

  @Test void loginDevuelve429ConRetryAfter() throws Exception {
    var limite = new LimiteSolicitudes(new IpCliente(0), reloj);
    MockHttpServletResponse ultima = null;
    for (int i = 0; i < 11; i++) {
      var req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
      req.setRemoteAddr("9.9.9.9");
      ultima = new MockHttpServletResponse();
      limite.doFilter(req, ultima, new MockFilterChain());
    }
    assertEquals(429, ultima.getStatus());
    assertNotNull(ultima.getHeader("Retry-After"));
  }

  @Test void rutasDeLecturaNoSeLimitan() throws Exception {
    var limite = new LimiteSolicitudes(new IpCliente(0), reloj);
    for (int i = 0; i < 50; i++) {
      var res = new MockHttpServletResponse();
      limite.doFilter(new MockHttpServletRequest("GET", "/api/v1/productos"), res, new MockFilterChain());
      assertEquals(200, res.getStatus());
    }
  }

  @Test void fallosPorCuentaAunqueCambieLaIp() {
    var limite = new LimiteSolicitudes(new IpCliente(0), reloj);
    for (int i = 0; i < 10; i++) limite.registrar("fallos|a@test.cl", Duration.ofMinutes(15));
    assertTrue(limite.bloqueada("fallos|a@test.cl", 10, Duration.ofMinutes(15)));
    assertFalse(limite.bloqueada("fallos|b@test.cl", 10, Duration.ofMinutes(15)));
  }

  @Test void laIpInventadaPorElClienteNoSeUsa() {
    var req = new MockHttpServletRequest();
    // El cliente envía "1.1.1.1" para evadir el límite; nginx agrega la IP real al final.
    req.addHeader("X-Forwarded-For", "1.1.1.1, 200.1.1.1");
    assertEquals("200.1.1.1", new IpCliente(0).de(req));
    // Con CloudFront delante: cliente falso, IP real (agregada por CloudFront), IP de CloudFront.
    req = new MockHttpServletRequest();
    req.addHeader("X-Forwarded-For", "1.1.1.1, 200.1.1.1, 130.176.0.5");
    assertEquals("200.1.1.1", new IpCliente(1).de(req));
  }
}
