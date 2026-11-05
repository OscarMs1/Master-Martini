package cl.mastermartini.controller;

import cl.mastermartini.dto.ContactoRequest;
import cl.mastermartini.service.ContactoService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contactos")
public class ContactoController {
  private final ContactoService service;

  public ContactoController(ContactoService service) {
    this.service = service;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, Object> crear(@Valid @RequestBody ContactoRequest r) {
    return Map.of("id", service.guardar(r), "message", "Mensaje guardado. No se envió correo.");
  }
}
