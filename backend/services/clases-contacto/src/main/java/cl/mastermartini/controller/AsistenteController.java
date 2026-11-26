package cl.mastermartini.controller;

import cl.mastermartini.dto.AsistenteRequest;
import cl.mastermartini.service.AsistenteService;
import cl.mastermartini.service.ConsultaAsistenteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/asistente")
public class AsistenteController {
  private final AsistenteService service;
  private final ConsultaAsistenteService consultas;

  public AsistenteController(AsistenteService service, ConsultaAsistenteService consultas) {
    this.service = service;
    this.consultas = consultas;
  }

  @PostMapping
  public Map<String, String> responder(@Valid @RequestBody AsistenteRequest r, HttpServletRequest http) {
    // El gateway informa la IP real del visitante; sirve para limitar abusos.
    String cliente = http.getHeader("X-Client-Ip");
    String pregunta = ultimaPregunta(r.mensajes());
    try {
      String respuesta = service.responder(r, cliente == null ? "desconocido" : cliente);
      consultas.registrar(pregunta, true);
      return Map.of("respuesta", respuesta);
    } catch (ResponseStatusException e) {
      // Se anota cuando el asistente no pudo responder por un fallo propio (sin saldo, sin conexión).
      // Los rechazos por exceso de preguntas (429) o por datos inválidos (400) no se registran.
      if (e.getStatusCode().is5xxServerError()) consultas.registrar(pregunta, false);
      throw e;
    }
  }

  /** La pregunta que el visitante acaba de escribir: el último mensaje suyo de la conversación. */
  private static String ultimaPregunta(List<AsistenteRequest.Mensaje> mensajes) {
    for (int i = mensajes.size() - 1; i >= 0; i--) {
      if ("user".equals(mensajes.get(i).rol())) return mensajes.get(i).texto();
    }
    return "";
  }
}
