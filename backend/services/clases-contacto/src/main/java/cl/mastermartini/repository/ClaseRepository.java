package cl.mastermartini.repository;

import cl.mastermartini.model.Clase;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaseRepository extends JpaRepository<Clase, Long> {
  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select c from Clase c where c.id = :id")
  java.util.Optional<Clase> bloquear(
      @org.springframework.data.repository.query.Param("id") Long id);
}
