package cl.mastermartini.repository;

import cl.mastermartini.model.Favorito;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface FavoritoRepository extends JpaRepository<Favorito, Long> {
  List<Favorito> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

  Optional<Favorito> findByUsuarioIdAndProducto_Id(Long usuarioId, Long productoId);

  long deleteByUsuarioIdAndProducto_Id(Long usuarioId, Long productoId);

  /** Borra los favoritos de un producto (al eliminarlo del catálogo). */
  @Modifying
  @Query("delete from Favorito f where f.producto.id = :productoId")
  int borrarDeProducto(@Param("productoId") Long productoId);
}
