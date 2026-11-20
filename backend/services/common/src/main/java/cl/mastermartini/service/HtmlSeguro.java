package cl.mastermartini.service;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;

/**
 * Limpia el HTML del editor enriquecido antes de guardarlo. La web ya lo limpia con DOMPurify al
 * mostrarlo, pero así la base de datos nunca guarda scripts y cualquier otro cliente de la API
 * (por ejemplo, la app móvil) recibe HTML seguro. Usa las mismas etiquetas que la web
 * (frontend/src/utils/contenidoEnriquecido.js).
 */
public final class HtmlSeguro {
  private static final PolicyFactory POLITICA =
      new HtmlPolicyBuilder()
          .allowElements(
              "p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "ul", "ol", "li",
              "blockquote", "hr", "a", "code", "pre")
          .allowUrlProtocols("http", "https", "mailto", "tel")
          .allowAttributes("href").onElements("a")
          .requireRelsOnLinks("noopener", "noreferrer")
          .toFactory();

  private HtmlSeguro() {}

  public static String limpiar(String html) {
    return html == null ? null : POLITICA.sanitize(html).trim();
  }

  /** true si al limpiar no quedó texto visible (por ejemplo, el mensaje era solo un script). */
  public static boolean sinTexto(String html) {
    return html == null || html.replaceAll("<[^>]*>", "").replace("&nbsp;", " ").replace("&#160;", " ").isBlank();
  }
}
