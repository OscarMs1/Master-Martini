package cl.mastermartini.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * IP real del cliente. nginx agrega la IP que lo llamó al final de X-Forwarded-For; los valores
 * anteriores los puede inventar el cliente. Con {@code PROXIES_CONFIABLES=1} (CloudFront delante de
 * nginx) se toma la penúltima, que es la que agregó CloudFront.
 */
@Component
public class IpCliente {
  private final int proxies;

  public IpCliente(@Value("${app.proxies-confiables:0}") int proxies) {
    this.proxies = Math.max(0, proxies);
  }

  public String de(HttpServletRequest r) {
    String xff = r.getHeader("X-Forwarded-For");
    if (xff == null || xff.isBlank()) return r.getRemoteAddr();
    String[] partes = xff.split(",");
    int i = Math.max(0, partes.length - 1 - proxies);
    return partes[i].trim();
  }
}
