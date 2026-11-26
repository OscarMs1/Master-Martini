package cl.mastermartini.controller;

import cl.mastermartini.service.ConsultaAsistenteService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Estadísticas del asistente de ayuda para el administrador (el acceso lo filtra /api/v1/admin/**). */
@RestController
public class AdminAsistenteController {
  private final ConsultaAsistenteService consultas;

  public AdminAsistenteController(ConsultaAsistenteService consultas) {
    this.consultas = consultas;
  }

  @GetMapping("/api/v1/admin/asistente/consultas")
  public Map<String, Object> consultas() {
    return consultas.resumen();
  }
}
