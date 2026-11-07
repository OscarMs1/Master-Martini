package cl.mastermartini.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Misma selección acotada que registro y checkout; no cambia datos históricos. */
public final class Ubicaciones {
  private record Region(String region, List<String> comunas) {}
  private static final List<Region> REGIONES = cargar();
  private Ubicaciones() {}
  private static List<Region> cargar() {
    try (var input = Ubicaciones.class.getResourceAsStream("/regiones-comunas.json")) {
      return new ObjectMapper().readValue(input, new TypeReference<List<Region>>() {});
    } catch (Exception e) { throw new IllegalStateException("No se pudo cargar el catálogo de ubicaciones", e); }
  }
  private static String normalizar(String value) {
    return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
        .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).replaceAll("[’']", "")
        .replaceAll("[^a-z0-9]+", " ").trim().replaceFirst("^region (de |del )?", "");
  }
  public static String validar(String region, String comuna) {
    String nombre = normalizar(region);
    if (List.of("rm", "metropolitana", "santiago").contains(nombre)) nombre = "metropolitana de santiago";
    for (Region r : REGIONES) {
      if (normalizar(r.region()).equals(nombre) && r.comunas().contains(comuna)) return r.region();
    }
    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona una comuna de la región indicada.");
  }
}
