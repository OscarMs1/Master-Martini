package cl.mastermartini.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class ConsultaAsistenteServiceTest {

  @Test
  void normalizaTildesSignosYMayusculas() {
    assertEquals("que ofertas hay", ConsultaAsistenteService.normalizar("¿Qué OFERTAS hay?"));
    assertEquals("cuando son las proximas clases", ConsultaAsistenteService.normalizar("  ¿Cuándo son las próximas clases?!  "));
  }

  @Test
  void preguntasEquivalentesGeneranLaMismaClave() {
    assertEquals(
        ConsultaAsistenteService.normalizar("¿Qué ofertas hay?"),
        ConsultaAsistenteService.normalizar("que ofertas hay"));
  }

  @Test
  void textoSoloConSignosQuedaVacio() {
    assertEquals("", ConsultaAsistenteService.normalizar("¿¿??!!"));
    assertEquals("", ConsultaAsistenteService.normalizar(null));
  }

  @Test
  void compactaEspaciosYSaltosDeLinea() {
    assertEquals("hola que tal", ConsultaAsistenteService.compactar("  hola\n\n  que   tal "));
  }

  @Test
  void cortaALos300CaracteresSinPartirUnEmoji() {
    String largo = "a".repeat(299) + "😀😀";
    String texto = ConsultaAsistenteService.compactar(largo);
    assertTrue(texto.length() <= ConsultaAsistenteService.MAX_CARACTERES);
    assertFalse(Character.isHighSurrogate(texto.charAt(texto.length() - 1)));
    assertTrue(ConsultaAsistenteService.normalizar("b".repeat(500)).length() <= 300);
  }
}
