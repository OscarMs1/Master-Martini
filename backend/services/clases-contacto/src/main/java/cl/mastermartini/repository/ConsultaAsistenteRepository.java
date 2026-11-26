package cl.mastermartini.repository;

import cl.mastermartini.model.ConsultaAsistente;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface ConsultaAsistenteRepository extends JpaRepository<ConsultaAsistente, Long> {

  /** Fila del ranking: una pregunta (con un ejemplo de cómo la escribieron) y cuántas veces se hizo. */
  interface Frecuente {
    String getEjemplo();

    long getVeces();
  }

  List<ConsultaAsistente> findTop50ByOrderByFechaDesc();

  long countByFechaGreaterThanEqual(Instant desde);

  @Query("select c.fecha from ConsultaAsistente c where c.fecha >= :desde")
  List<Instant> fechasDesde(@Param("desde") Instant desde);

  @Query(
      "select min(c.texto) as ejemplo, count(c) as veces from ConsultaAsistente c "
          + "group by c.clave order by count(c) desc, min(c.fecha) asc")
  List<Frecuente> masFrecuentes(Pageable pagina);

  @Modifying
  @Transactional
  @Query("delete from ConsultaAsistente c where c.fecha < :limite")
  int borrarAnteriores(@Param("limite") Instant limite);
}
