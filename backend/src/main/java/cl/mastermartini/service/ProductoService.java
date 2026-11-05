package cl.mastermartini.service;

import cl.mastermartini.dto.ProductoRequest;
import cl.mastermartini.model.Producto;
import cl.mastermartini.repository.ProductoRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductoService {
  private final ProductoRepository repo;

  private final ImagenService imagenes;
  public ProductoService(ProductoRepository repo, ImagenService imagenes) {
    this.imagenes = imagenes;
    this.repo = repo;
  }

  public List<Producto> listar() {
    return repo.findAll(org.springframework.data.domain.Sort.by("id")).stream().filter(p -> !p.isRetirado()).toList();
  }

  public Producto obtener(Long id) {
    return repo.findById(id).filter(p -> !p.isRetirado())
        .orElseThrow(
            () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado."));
  }

  @Transactional
  public Producto guardar(Long id, ProductoRequest r) {
    imagenes.validarReferencia(r.imagen());
    Producto p =
        id == null
            ? new Producto()
            : repo.bloquear(id)
                .orElseThrow(
                    () ->
                        new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Producto no encontrado."));
    p.setNombre(r.nombre().trim());
    p.setCategoria(r.categoria());
    p.setFormato(r.formato().trim());
    p.setDescripcion(r.descripcion().trim());
    p.setPrecio(r.precio());
    p.setDescuento(r.descuento());
    p.setStock(r.stock());
    p.setImagen(r.imagen());
    p.setDestacado(r.destacado());
    return repo.save(p);
  }

  @Transactional
  public void eliminar(Long id) {
    Producto p =
        repo.bloquear(id)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado."));
    repo.delete(p);
  }
}
