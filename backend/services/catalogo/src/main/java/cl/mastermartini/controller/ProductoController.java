package cl.mastermartini.controller;

import cl.mastermartini.dto.ProductoRequest;
import cl.mastermartini.model.Producto;
import cl.mastermartini.service.ProductoService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
  private final ProductoService service;
  private final cl.mastermartini.service.OfertaService ofertas;

  public ProductoController(ProductoService service, cl.mastermartini.service.OfertaService ofertas) {
    this.service = service;
    this.ofertas = ofertas;
  }

  @GetMapping
  public List<Producto> listar() {
    return service.listar();
  }

  @GetMapping("/ofertas")
  public List<Producto> ofertas() {
    return service.listar().stream().filter(ofertas::vigente).toList();
  }

  @GetMapping("/{id}")
  public Producto obtener(@PathVariable Long id) {
    return service.obtener(id);
  }

  @PostMapping
  public ResponseEntity<Producto> crear(@Valid @RequestBody ProductoRequest r) {
    Producto p = service.guardar(null, r);
    return ResponseEntity.created(URI.create("/api/productos/" + p.getId())).body(p);
  }

  @PutMapping("/{id}")
  public Producto editar(@PathVariable Long id, @Valid @RequestBody ProductoRequest r) {
    return service.guardar(id, r);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void eliminar(@PathVariable Long id) {
    service.eliminar(id);
  }
}
