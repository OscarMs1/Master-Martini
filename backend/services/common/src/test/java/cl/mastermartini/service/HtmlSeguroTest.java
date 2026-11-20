package cl.mastermartini.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class HtmlSeguroTest {
  @Test void quitaScriptsYEventosPeroConservaElFormato() {
    String limpio = HtmlSeguro.limpiar(
        "<p>Hola <strong>chef</strong><img src=x onerror=alert(1)><script>alert(2)</script></p>"
            + "<ul><li>uno</li></ul><h2 onclick=\"x()\">Título</h2>");
    assertEquals("<p>Hola <strong>chef</strong></p><ul><li>uno</li></ul><h2>Título</h2>", limpio);
  }

  @Test void enlacesSeguros() {
    assertFalse(HtmlSeguro.limpiar("<a href=\"javascript:alert(1)\">x</a>").contains("javascript"));
    String enlace = HtmlSeguro.limpiar("<a href=\"https://mastermartini.cl\" target=\"_top\">sitio</a>");
    assertTrue(enlace.contains("href=\"https://mastermartini.cl\""));
    assertTrue(enlace.contains("noopener") && enlace.contains("noreferrer"));
    assertFalse(enlace.contains("target"));
    assertTrue(HtmlSeguro.limpiar("<a href=\"/clases\">clases</a>").contains("href=\"/clases\""));
  }

  @Test void detectaContenidoSinTexto() {
    assertTrue(HtmlSeguro.sinTexto(HtmlSeguro.limpiar("<script>alert(1)</script><p> </p>")));
    assertFalse(HtmlSeguro.sinTexto(HtmlSeguro.limpiar("<p>Hola</p>")));
  }
}
