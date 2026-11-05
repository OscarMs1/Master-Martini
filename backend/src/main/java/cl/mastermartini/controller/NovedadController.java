package cl.mastermartini.controller;
import cl.mastermartini.model.Novedad;
import cl.mastermartini.dto.NovedadRequest;
import cl.mastermartini.repository.NovedadRepository;
import cl.mastermartini.service.NovedadService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
@RestController @RequestMapping("/api")
public class NovedadController {
 private final NovedadRepository repo;private final NovedadService service;
 public NovedadController(NovedadRepository repo,NovedadService service){this.repo=repo;this.service=service;}
 @GetMapping("/novedades") public List<Novedad> listar(){return repo.findByPublicadoTrueOrderByFechaDesc();}
 @GetMapping("/novedades/{slug}") public Novedad obtener(@PathVariable String slug){return repo.findBySlugAndPublicadoTrue(slug).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Artículo no encontrado."));}
 @GetMapping("/admin/novedades") public List<Novedad> todas(){return repo.findAll(org.springframework.data.domain.Sort.by("fecha").descending());}
 @PostMapping("/admin/novedades") @ResponseStatus(HttpStatus.CREATED) public Novedad crear(@Valid @RequestBody NovedadRequest r){return service.guardar(null,r);}
 @PutMapping("/admin/novedades/{id}") public Novedad editar(@PathVariable Long id,@Valid @RequestBody NovedadRequest r){return service.guardar(id,r);}
}
