package cl.mastermartini.service;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.web.server.ResponseStatusException;
class UbicacionesTest {
  @Test void aceptaRegionActualYAliasHistorico() {
    assertEquals("Región Metropolitana de Santiago", Ubicaciones.validar("Metropolitana", "Santiago"));
    assertEquals("Región del Biobío", Ubicaciones.validar("Región del Biobío", "Concepción"));
  }
  @Test void impideMezclarRegionYComunaOInventarLocalidades() {
    assertThrows(ResponseStatusException.class, () -> Ubicaciones.validar("Región del Biobío", "Santiago"));
    assertThrows(ResponseStatusException.class, () -> Ubicaciones.validar("Inventada", "Santiago"));
  }
}
