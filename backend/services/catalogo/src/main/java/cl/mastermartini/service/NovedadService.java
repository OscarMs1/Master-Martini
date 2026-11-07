package cl.mastermartini.service;
import cl.mastermartini.model.Novedad;import cl.mastermartini.repository.NovedadRepository;import cl.mastermartini.dto.NovedadRequest;import java.util.List;import org.springframework.stereotype.Service;import org.springframework.transaction.annotation.Transactional;import org.springframework.web.server.ResponseStatusException;import org.springframework.http.HttpStatus;
@Service public class NovedadService{
 private final NovedadRepository repo;private final ImagenService images;
 public NovedadService(NovedadRepository repo,ImagenService images){this.repo=repo;this.images=images;}
 public List<Novedad> publicadas(){return repo.findByPublicadoTrueOrderByFechaDesc();}
 public Novedad obtener(String slug){return repo.findBySlugAndPublicadoTrue(slug).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));}
 public List<Novedad> todas(){return repo.findAll();}
 @Transactional public Novedad guardar(Long id,NovedadRequest r){images.validarReferencia(r.imagen());var n=id==null?new Novedad():repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));n.setTitulo(r.titulo());n.setSlug(r.slug());n.setBajada(r.bajada());n.setContenido(r.contenido());n.setFecha(r.fecha());n.setImagen(r.imagen());n.setPublicado(r.publicado());return repo.save(n);}
}
