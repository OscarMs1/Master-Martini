package cl.mastermartini.repository;

import cl.mastermartini.model.RefreshToken;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
  /** Bloquea la fila: dos renovaciones simultáneas con el mismo token no pueden ganar las dos. */
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  Optional<RefreshToken> findByHash(String hash);

  @Modifying
  @Query("update RefreshToken t set t.revocado = true where t.familia = :familia")
  int revocarFamilia(@Param("familia") String familia);

  @Modifying
  @Query("update RefreshToken t set t.revocado = true where t.email = :email")
  int revocarEmail(@Param("email") String email);

  @Modifying
  @Query("delete from RefreshToken t where t.expira < :limite")
  int borrarVencidos(@Param("limite") Instant limite);
}
