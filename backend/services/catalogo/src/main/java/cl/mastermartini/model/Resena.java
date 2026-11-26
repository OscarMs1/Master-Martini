package cl.mastermartini.model;

import jakarta.persistence.*;
import java.time.Instant;

/** Opinión de un cliente sobre un producto (una por cliente y producto). Relación N:1 con {@link Producto}. */
@Entity
@Table(name = "resena", uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "producto_id"}))
public class Resena {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** El usuario vive en otro microservicio (auth-usuarios), por eso se guarda solo su id. */
  @Column(name = "usuario_id", nullable = false)
  private Long usuarioId;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "producto_id", nullable = false)
  private Producto producto;

  @Column(nullable = false, length = 80)
  private String autor;

  @Column(nullable = false)
  private int puntuacion;

  /** HTML limpio del editor (TipTap): hasta 500 caracteres de texto visible. */
  @Column(nullable = false, length = 2000)
  private String comentario;

  @Column(nullable = false)
  private Instant fecha;

  protected Resena() {}

  public Resena(Long usuarioId, Producto producto) {
    this.usuarioId = usuarioId;
    this.producto = producto;
  }

  public Long getId() { return id; }
  public Long getUsuarioId() { return usuarioId; }
  public Producto getProducto() { return producto; }
  public String getAutor() { return autor; }
  public int getPuntuacion() { return puntuacion; }
  public String getComentario() { return comentario; }
  public Instant getFecha() { return fecha; }

  public void actualizar(String autor, int puntuacion, String comentario, Instant fecha) {
    this.autor = autor;
    this.puntuacion = puntuacion;
    this.comentario = comentario;
    this.fecha = fecha;
  }
}
