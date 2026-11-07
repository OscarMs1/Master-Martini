package cl.mastermartini.repository;
import cl.mastermartini.model.Novedad;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface NovedadRepository extends JpaRepository<Novedad,Long> {
 List<Novedad> findByPublicadoTrueOrderByFechaDesc();
 Optional<Novedad> findBySlugAndPublicadoTrue(String slug);
 boolean existsBySlug(String slug);
}
