package cl.mastermartini.service;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class HtmlSeguroResenaTest {
  @Test void conservaFormatoBasicoYQuitaLoPeligroso() {
    String limpio = HtmlSeguro.limpiarResena("<p><strong>Muy buena</strong> <a href=\"https://spam.cl\">aquí</a></p><script>alert(1)</script><h2>x</h2><ul><li>rinde</li></ul>");
    assertTrue(limpio.contains("<strong>Muy buena</strong>"));
    assertTrue(limpio.contains("<ul><li>rinde</li></ul>"));
    assertFalse(limpio.contains("<a"));
    assertFalse(limpio.contains("script"));
    assertFalse(limpio.contains("<h2"));
  }
  @Test void cuentaSoloElTextoVisible() {
    assertEquals("Hola @chef & co", HtmlSeguro.textoVisible(HtmlSeguro.limpiarResena("<p>Hola <em>@chef</em> &amp; co</p>")));
    assertEquals("", HtmlSeguro.textoVisible("<p></p>"));
  }
}
