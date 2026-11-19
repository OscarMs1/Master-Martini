package cl.mastermartini.controller;

import cl.mastermartini.dto.AsistenteRequest;
import cl.mastermartini.service.AsistenteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/asistente")
public class AsistenteController {
  private final AsistenteService service;

  public AsistenteController(AsistenteService service) {
    this.service = service;
  }

  @PostMapping
  public Map<String, String> responder(@Valid @RequestBody AsistenteRequest r, HttpServletRequest http) {
    // El gateway informa la IP real del visitante; sirve para limitar abusos.
    String cliente = http.getHeader("X-Client-Ip");
    return Map.of("respuesta", service.responder(r, cliente == null ? "desconocido" : cliente));
  }
}
