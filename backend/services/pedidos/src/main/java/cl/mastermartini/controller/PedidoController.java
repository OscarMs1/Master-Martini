package cl.mastermartini.controller;

import cl.mastermartini.dto.PedidoRequest;
import cl.mastermartini.model.Pedido;
import cl.mastermartini.service.PedidoService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
  private final PedidoService service;

  public PedidoController(PedidoService service) {
    this.service = service;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Pedido crear(@Valid @RequestBody PedidoRequest r, Principal principal) {
    return service.crear(r, principal == null ? null : principal.getName());
  }

  @GetMapping("/mis-pedidos")
  public List<Pedido> propios(Principal principal) {
    return service.propios(principal.getName());
  }
}
