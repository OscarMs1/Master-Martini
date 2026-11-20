package cl.mastermartini.repository;

import cl.mastermartini.model.Favorito;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoritoRepository extends JpaRepository<Favorito, Long> {
  List<Favorito> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

  Optional<Favorito> findByUsuarioIdAndProducto_Id(Long usuarioId, Long productoId);

  long deleteByUsuarioIdAndProducto_Id(Long usuarioId, Long productoId);
}
