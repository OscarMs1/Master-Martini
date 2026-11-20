package cl.mastermartini.model;

import jakarta.persistence.*;

@Entity
/** Inscripción de un cliente en una clase. Relación N:1 con {@link Clase}. */
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"usuarioId", "clase_id"}))
public class Inscripcion {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  public Long getId() {
    return id;
  }

  @Column(nullable = false)
  private Long usuarioId;

  @ManyToOne(optional = false)
  @JoinColumn(name = "clase_id", nullable = false)
  private Clase clase;

  @Column(nullable = false)
  private java.time.Instant fecha;

  public Long getUsuarioId() {
    return usuarioId;
  }

  public void setUsuarioId(Long usuarioId) {
    this.usuarioId = usuarioId;
  }

  public Clase getClase() {
    return clase;
  }

  public void setClase(Clase clase) {
    this.clase = clase;
  }

  public Long getClaseId() {
    return clase == null ? null : clase.getId();
  }

  public java.time.Instant getFecha() {
    return fecha;
  }

  public void setFecha(java.time.Instant fecha) {
    this.fecha = fecha;
  }
}
