package cl.mastermartini.repository;

import cl.mastermartini.model.Inscripcion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {
  boolean existsByUsuarioIdAndClase_Id(Long usuarioId, Long claseId);

  long countByClase_Id(Long claseId);

  java.util.List<Inscripcion> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
}
