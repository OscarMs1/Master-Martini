package cl.mastermartini.service;

import cl.mastermartini.model.*;
import cl.mastermartini.repository.FavoritoRepository;
import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FavoritoService {
  private final FavoritoRepository repo;

  public FavoritoService(FavoritoRepository repo) {
    this.repo = repo;
  }

  @Transactional(readOnly = true)
  public List<Map<String, Object>> listar(long usuarioId) {
    return repo.findByUsuarioIdOrderByFechaDesc(usuarioId).stream()
        .map(f -> {
          Map<String, Object> out = new LinkedHashMap<>();
          out.put("productoId", f.getProducto().getId());
          out.put("fecha", f.getFecha());
          return out;
        })
        .toList();
  }

  /** Guardar dos veces el mismo favorito no lo duplica. */
  @Transactional
  public Map<String, Object> guardar(long usuarioId, Producto producto) {
    if (repo.findByUsuarioIdAndProducto_Id(usuarioId, producto.getId()).isEmpty())
      repo.save(new Favorito(usuarioId, producto, Instant.now()));
    return Map.of("productoId", producto.getId(), "guardado", true);
  }

  @Transactional
  public void quitar(long usuarioId, long productoId) {
    repo.deleteByUsuarioIdAndProducto_Id(usuarioId, productoId);
  }
}
