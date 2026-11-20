package cl.mastermartini.repository;

import cl.mastermartini.model.Resena;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ResenaRepository extends JpaRepository<Resena, Long> {
  List<Resena> findTop100ByProducto_IdOrderByFechaDesc(Long productoId);

  Optional<Resena> findByUsuarioIdAndProducto_Id(Long usuarioId, Long productoId);

  long countByProducto_Id(Long productoId);

  @Query("select coalesce(avg(r.puntuacion), 0) from Resena r where r.producto.id = :productoId")
  double promedio(@Param("productoId") Long productoId);

  /** Borra las opiniones de un producto (al eliminarlo del catálogo). */
  @Modifying
  @Query("delete from Resena r where r.producto.id = :productoId")
  int borrarDeProducto(@Param("productoId") Long productoId);
}
