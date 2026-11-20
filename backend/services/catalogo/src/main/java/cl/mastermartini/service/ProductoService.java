package cl.mastermartini.service;

import cl.mastermartini.dto.ProductoRequest;
import cl.mastermartini.model.Producto;
import cl.mastermartini.repository.FavoritoRepository;
import cl.mastermartini.repository.ProductoRepository;
import cl.mastermartini.repository.ResenaRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductoService {
  private final ProductoRepository repo;

  private final ImagenService imagenes;
  private final FavoritoRepository favoritos;
  private final ResenaRepository resenas;

  public ProductoService(
      ProductoRepository repo, ImagenService imagenes, FavoritoRepository favoritos, ResenaRepository resenas) {
    this.imagenes = imagenes;
    this.repo = repo;
    this.favoritos = favoritos;
    this.resenas = resenas;
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
    // Las opiniones y favoritos dependen del producto (llave foránea): se borran en la misma
    // transacción. Los pedidos no se tocan: guardan su propio detalle en el servicio de pedidos.
    favoritos.borrarDeProducto(id);
    resenas.borrarDeProducto(id);
    repo.delete(p);
  }
}
