package cl.mastermartini.service;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.web.server.ResponseStatusException;
class UbicacionesTest {
  @Test void aceptaRegionActualYAliasHistorico() {
    assertEquals("Región Metropolitana de Santiago", Ubicaciones.validar("Metropolitana", "Santiago"));
    assertEquals("Región del Biobío", Ubicaciones.validar("Región del Biobío", "Concepción"));
  }
  @Test void incluyeLasDieciseisRegiones() {
    assertEquals("Región de Arica y Parinacota", Ubicaciones.validar("Arica y Parinacota", "Putre"));
    assertEquals("Región de Magallanes y de la Antártica Chilena", Ubicaciones.validar("Región de Magallanes y de la Antártica Chilena", "Punta Arenas"));
    assertEquals("Región de Ñuble", Ubicaciones.validar("Región de Ñuble", "Chillán"));
  }
  @Test void impideMezclarRegionYComunaOInventarLocalidades() {
    assertThrows(ResponseStatusException.class, () -> Ubicaciones.validar("Región del Biobío", "Santiago"));
    assertThrows(ResponseStatusException.class, () -> Ubicaciones.validar("Inventada", "Santiago"));
  }
}
