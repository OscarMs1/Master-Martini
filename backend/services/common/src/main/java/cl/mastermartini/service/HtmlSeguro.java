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

  /**
   * Reseñas de productos: solo formato básico (negrita, cursiva, listas). Sin enlaces ni títulos,
   * para que una opinión no se use como publicidad ni rompa el diseño de la ficha.
   */
  private static final PolicyFactory POLITICA_RESENA =
      new HtmlPolicyBuilder()
          .allowElements("p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li")
          .toFactory();

  private HtmlSeguro() {}

  public static String limpiarResena(String html) {
    return html == null ? null : POLITICA_RESENA.sanitize(html).trim();
  }

  /** Texto que ve el lector (sin etiquetas), para validar largos mínimos y máximos. */
  public static String textoVisible(String html) {
    if (html == null) return "";
    String t = html.replaceAll("<[^>]*>", " ")
        .replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"");
    // El sanitizador escribe algunos signos como entidades numéricas (&#64; = @): cuentan como un carácter.
    t = java.util.regex.Pattern.compile("&#(x?)([0-9a-fA-F]+);").matcher(t)
        .replaceAll(m -> java.util.regex.Matcher.quoteReplacement(
            new String(Character.toChars(Integer.parseInt(m.group(2), m.group(1).isEmpty() ? 10 : 16)))));
    return t.replaceAll("\\s+", " ").trim();
  }

  public static String limpiar(String html) {
    return html == null ? null : POLITICA.sanitize(html).trim();
  }

  /** true si al limpiar no quedó texto visible (por ejemplo, el mensaje era solo un script). */
  public static boolean sinTexto(String html) {
    return html == null || html.replaceAll("<[^>]*>", "").replace("&nbsp;", " ").replace("&#160;", " ").isBlank();
  }
}
