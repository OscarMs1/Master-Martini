package cl.mastermartini.controller;

import cl.mastermartini.dto.InscripcionRequest;
import cl.mastermartini.service.ClaseService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ClaseController {
  private final ClaseService service;

  public ClaseController(ClaseService service) {
    this.service = service;
  }

  @GetMapping("/clases")
  public List<Map<String, Object>> listar() {
    return service.listar();
  }

  @PostMapping("/inscripciones")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> inscribir(
      @Valid @RequestBody InscripcionRequest r, Principal principal) {
    return service.inscribir(r.claseId(), principal.getName());
  }

  @GetMapping("/inscripciones/mis-inscripciones")
  public List<Map<String, Object>> propias(Principal principal) {
    return service.propias(principal.getName());
  }
}
