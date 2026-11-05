package cl.mastermartini.model;

import jakarta.persistence.*;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"usuarioId", "claseId"}))
public class Inscripcion {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  public Long getId() {
    return id;
  }

  @Column(nullable = false)
  private Long usuarioId;

  @Column(nullable = false)
  private Long claseId;

  @Column(nullable = false)
  private java.time.Instant fecha;

  public Long getUsuarioId() {
    return usuarioId;
  }

  public void setUsuarioId(Long usuarioId) {
    this.usuarioId = usuarioId;
  }

  public Long getClaseId() {
    return claseId;
  }

  public void setClaseId(Long claseId) {
    this.claseId = claseId;
  }

  public java.time.Instant getFecha() {
    return fecha;
  }

  public void setFecha(java.time.Instant fecha) {
    this.fecha = fecha;
  }
}
