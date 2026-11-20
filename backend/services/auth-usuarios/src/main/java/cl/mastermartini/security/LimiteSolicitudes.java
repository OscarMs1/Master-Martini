package cl.mastermartini.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.time.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.*;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Límite de solicitudes por IP en las rutas que un atacante automatizaría: login (fuerza bruta),
 * registro, formulario de contacto y pedidos (spam). Responde 429 con Retry-After.
 *
 * <p>Ventana fija en memoria: suficiente para un gateway único. Con varias instancias habría que
 * moverlo a Redis o a AWS WAF.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class LimiteSolicitudes extends OncePerRequestFilter {
  record Regla(String nombre, int maximo, Duration ventana) {}

  private static final Map<String, Regla> REGLAS = Map.of(
      "/api/v1/auth/login", new Regla("login", 10, Duration.ofMinutes(5)),
      "/api/v1/auth/token", new Regla("login", 10, Duration.ofMinutes(5)),
      "/api/v1/auth/registro", new Regla("registro", 5, Duration.ofHours(1)),
      "/api/v1/auth/refresh", new Regla("refresh", 60, Duration.ofMinutes(5)),
      "/api/v1/auth/password", new Regla("password", 5, Duration.ofMinutes(15)),
      "/api/v1/contactos", new Regla("contacto", 5, Duration.ofMinutes(10)),
      "/api/v1/pedidos", new Regla("pedidos", 20, Duration.ofMinutes(10)),
      "/api/v1/inscripciones", new Regla("inscripciones", 20, Duration.ofMinutes(10)));

  private record Ventana(long inicio, int usados) {}

  private final Map<String, Ventana> ventanas = new ConcurrentHashMap<>();
  private final IpCliente ip;
  private final Clock reloj;

  @Autowired
  public LimiteSolicitudes(IpCliente ip) {
    this(ip, Clock.systemUTC());
  }

  LimiteSolicitudes(IpCliente ip, Clock reloj) {
    this.ip = ip;
    this.reloj = reloj;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest r) {
    return !"POST".equals(r.getMethod()) || !REGLAS.containsKey(r.getRequestURI());
  }

  @Override
  protected void doFilterInternal(HttpServletRequest r, HttpServletResponse s, FilterChain chain)
      throws ServletException, IOException {
    Regla regla = REGLAS.get(r.getRequestURI());
    long espera = consumir(regla.nombre() + "|" + ip.de(r), regla.maximo(), regla.ventana());
    if (espera > 0) {
      s.setStatus(429);
      s.setHeader("Retry-After", String.valueOf(espera));
      s.setContentType("application/json;charset=UTF-8");
      s.getWriter().write("{\"message\":\"Demasiados intentos. Espera unos minutos y vuelve a intentarlo.\"}");
      return;
    }
    chain.doFilter(r, s);
  }

  /** Devuelve 0 si se permite; si no, los segundos que faltan para la próxima ventana. */
  long consumir(String clave, int maximo, Duration ventana) {
    long ahora = reloj.millis();
    if (ventanas.size() > 50_000) limpiar(ahora);
    Ventana v = ventanas.compute(clave, (k, actual) ->
        actual == null || ahora - actual.inicio() >= ventana.toMillis()
            ? new Ventana(ahora, 1)
            : new Ventana(actual.inicio(), actual.usados() + 1));
    if (v.usados() <= maximo) return 0;
    return Math.max(1, (v.inicio() + ventana.toMillis() - ahora + 999) / 1000);
  }

  /** true si la clave ya alcanzó el máximo dentro de la ventana (no consume un intento). */
  public boolean bloqueada(String clave, int maximo, Duration ventana) {
    Ventana v = ventanas.get(clave);
    return v != null && reloj.millis() - v.inicio() < ventana.toMillis() && v.usados() >= maximo;
  }

  /** Cuenta un evento (por ejemplo, una contraseña incorrecta). */
  public void registrar(String clave, Duration ventana) {
    consumir(clave, Integer.MAX_VALUE, ventana);
  }

  private void limpiar(long ahora) {
    ventanas.entrySet().removeIf(e -> ahora - e.getValue().inicio() > Duration.ofHours(1).toMillis());
  }
}
