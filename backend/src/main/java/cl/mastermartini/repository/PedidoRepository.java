package cl.mastermartini.repository;

import cl.mastermartini.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
  java.util.List<Pedido> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

  boolean existsByRequestKey(String requestKey);
}
