package cl.mastermartini.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Pregunta hecha al asistente de ayuda. Solo guarda el texto de la pregunta (cortado) y la fecha:
 * no guarda la IP ni el usuario, porque los visitantes pueden escribir datos personales.
 */
@Entity
@Table(
    name = "consulta_asistente",
    indexes = {
      @Index(name = "idx_consulta_asistente_fecha", columnList = "fecha"),
      @Index(name = "idx_consulta_asistente_clave", columnList = "clave")
    })
public class ConsultaAsistente {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** Pregunta tal como la escribió el visitante (máximo 300 caracteres). */
  @Column(length = 300, nullable = false)
  private String texto;

  /** Pregunta normalizada (minúsculas, sin tildes ni signos) para agrupar las repetidas. */
  @Column(length = 300, nullable = false)
  private String clave;

  @Column(nullable = false)
  private Instant fecha;

  /** true si el asistente respondió; false si falló (sin saldo, sin conexión, etc.). */
  @Column(nullable = false)
  private boolean respondida;

  public Long getId() {
    return id;
  }

  public String getTexto() {
    return texto;
  }

  public void setTexto(String texto) {
    this.texto = texto;
  }

  public String getClave() {
    return clave;
  }

  public void setClave(String clave) {
    this.clave = clave;
  }

  public Instant getFecha() {
    return fecha;
  }

  public void setFecha(Instant fecha) {
    this.fecha = fecha;
  }

  public boolean isRespondida() {
    return respondida;
  }

  public void setRespondida(boolean respondida) {
    this.respondida = respondida;
  }
}
