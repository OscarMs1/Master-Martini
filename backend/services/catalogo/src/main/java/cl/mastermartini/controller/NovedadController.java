package cl.mastermartini.controller;
import cl.mastermartini.model.Novedad;
import cl.mastermartini.dto.NovedadRequest;
import cl.mastermartini.service.NovedadService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
@RestController @RequestMapping("/api")
public class NovedadController {
  private final NovedadService service;
  public NovedadController(NovedadService service){this.service=service;}
  @GetMapping("/novedades") public List<Novedad> listar(){return service.publicadas();}
  @GetMapping("/novedades/{slug}") public Novedad obtener(@PathVariable String slug){return service.obtener(slug);}
  @GetMapping("/admin/novedades") public List<Novedad> todas(){return service.todas();}
  @PostMapping("/admin/novedades") @ResponseStatus(HttpStatus.CREATED)
  public Novedad crear(@Valid @RequestBody NovedadRequest r){return service.guardar(null,r);}
  @PutMapping("/admin/novedades/{id}")
  public Novedad editar(@PathVariable Long id,@Valid @RequestBody NovedadRequest r){return service.guardar(id,r);}
}
