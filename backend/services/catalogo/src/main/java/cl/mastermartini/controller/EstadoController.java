package cl.mastermartini.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Estado de la API y comprobacion de conexion con la base de datos. */
@RestController
public class EstadoController {
  private final JdbcTemplate jdbc;

  public EstadoController(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  @GetMapping("/api/estado")
  public ResponseEntity<Map<String, Object>> estado() {
    Map<String, Object> salida = new LinkedHashMap<>();
    try {
      Integer respuesta = jdbc.queryForObject("SELECT 1", Integer.class);
      if (respuesta == null || respuesta != 1) throw new IllegalStateException("Sin respuesta SQL");
      salida.put("api", "ok");
      salida.put("baseDatos", "ok");
      return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(salida);
    } catch (Exception ex) {
      salida.put("api", "ok");
      salida.put("baseDatos", "sin conexion");
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .cacheControl(CacheControl.noStore()).body(salida);
    }
  }
}
