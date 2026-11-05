package cl.mastermartini.service;
import cl.mastermartini.model.Novedad;
import cl.mastermartini.dto.NovedadRequest;
import cl.mastermartini.repository.NovedadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
@Service
public class NovedadService {
 private final NovedadRepository repo; private final ImagenService imagenes;
 public NovedadService(NovedadRepository repo,ImagenService imagenes){this.repo=repo;this.imagenes=imagenes;}
 @Transactional public Novedad guardar(Long id,NovedadRequest r){
 imagenes.validarReferencia(r.imagen());
 Novedad n=id==null?new Novedad():repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
 n.setTitulo(r.titulo().trim());n.setSlug(r.slug());n.setBajada(r.bajada().trim());n.setContenido(r.contenido().trim());
 n.setImagen(r.imagen());n.setFecha(r.fecha());n.setPublicado(r.publicado());return repo.save(n);
 }
}
