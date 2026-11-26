package cl.mastermartini.controller;

import cl.mastermartini.security.Actor;
import cl.mastermartini.service.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/** Favoritos y reseñas de productos. */
@RestController
public class PreferenciasController {
  private final FavoritoService favoritos;
  private final ResenaService resenas;
  private final ProductoService productos;

  public PreferenciasController(FavoritoService favoritos, ResenaService resenas, ProductoService productos) {
    this.favoritos = favoritos;
    this.resenas = resenas;
    this.productos = productos;
  }

  public record Opinion(@Min(1) @Max(5) int puntuacion, @NotBlank @Size(min = 10, max = 4000) String comentario) {}

  private long user() {
    Long id = Actor.id();
    if (id == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Inicia sesión para continuar.");
    return id;
  }

  @GetMapping("/api/v1/favoritos")
  public List<Map<String, Object>> favoritos() {
    return favoritos.listar(user());
  }

  @PostMapping("/api/v1/favoritos/{id}")
  public Map<String, Object> agregar(@PathVariable long id) {
    return favoritos.guardar(user(), productos.obtener(id));
  }

  @DeleteMapping("/api/v1/favoritos/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void quitar(@PathVariable long id) {
    favoritos.quitar(user(), id);
  }

  @GetMapping("/api/v1/resenas/producto/{id}")
  public Map<String, Object> opiniones(@PathVariable long id) {
    productos.obtener(id);
    return resenas.listar(id, Actor.id());
  }

  @PostMapping("/api/v1/resenas/producto/{id}")
  public Map<String, Object> opinar(@PathVariable long id, @Valid @RequestBody Opinion o,
      @RequestHeader(value = "X-User-Name", defaultValue = "Cliente") String name) {
    var producto = productos.obtener(id);
    String[] partes = URLDecoder.decode(name, StandardCharsets.UTF_8).trim().split("\\s+");
    String autor = partes[0] + (partes.length > 1 ? " " + partes[1].substring(0, 1) + "." : "");
    return resenas.guardar(user(), producto, autor, o.puntuacion(), o.comentario());
  }

  @DeleteMapping("/api/v1/resenas/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void borrar(@PathVariable long id) {
    resenas.quitar(id, user(), Actor.admin());
  }
}
