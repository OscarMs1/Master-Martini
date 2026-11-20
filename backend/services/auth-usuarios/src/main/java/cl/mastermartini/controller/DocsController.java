package cl.mastermartini.controller;

import io.swagger.v3.oas.annotations.Hidden;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.*;

/** Entrega a Swagger UI la documentación de los servicios internos (que exigen X-Service-Key). */
@Hidden
@RestController
public class DocsController {
  private final Map<String, String> servicios;
  private final String key;
  private final boolean activo;
  private final RestClient client = RestClient.create();

  public DocsController(@Value("${app.catalog-url}") String catalog, @Value("${app.orders-url}") String orders,
      @Value("${app.classes-url}") String classes, @Value("${app.service-key}") String key,
      @Value("${springdoc.api-docs.enabled:true}") boolean activo) {
    this.servicios = Map.of("catalogo", catalog, "pedidos", orders, "clases-contacto", classes);
    this.key = key;
    this.activo = activo;
  }

  @GetMapping(value = "/v3/servicios/{servicio}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<String> docs(@PathVariable String servicio) {
    String base = servicios.get(servicio);
    if (!activo || base == null) return ResponseEntity.notFound().build();
    try {
      return ResponseEntity.ok(client.get().uri(base + "/v3/api-docs").header("X-Service-Key", key).retrieve().body(String.class));
    } catch (RestClientException e) {
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("{\"message\":\"Servicio temporalmente no disponible.\"}");
    }
  }
}
