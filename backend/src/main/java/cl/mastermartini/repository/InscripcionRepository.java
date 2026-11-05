package cl.mastermartini.repository;

import cl.mastermartini.model.Inscripcion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {
  boolean existsByUsuarioIdAndClaseId(Long usuarioId, Long claseId);

  long countByClaseId(Long claseId);

  java.util.List<Inscripcion> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
}
