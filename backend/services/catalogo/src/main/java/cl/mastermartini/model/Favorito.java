package cl.mastermartini.model;

import jakarta.persistence.*;
import java.time.Instant;

/** Producto que un cliente marcó como favorito. Relación N:1 con {@link Producto}. */
@Entity
@Table(name = "favorito", uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "producto_id"}))
public class Favorito {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** El usuario vive en otro microservicio (auth-usuarios), por eso se guarda solo su id. */
  @Column(name = "usuario_id", nullable = false)
  private Long usuarioId;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "producto_id", nullable = false)
  private Producto producto;

  @Column(nullable = false)
  private Instant fecha;

  protected Favorito() {}

  public Favorito(Long usuarioId, Producto producto, Instant fecha) {
    this.usuarioId = usuarioId;
    this.producto = producto;
    this.fecha = fecha;
  }

  public Long getId() { return id; }
  public Long getUsuarioId() { return usuarioId; }
  public Producto getProducto() { return producto; }
  public Instant getFecha() { return fecha; }
}
