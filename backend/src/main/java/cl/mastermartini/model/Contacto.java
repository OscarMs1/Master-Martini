package cl.mastermartini.model;

import jakarta.persistence.*;

@Entity
public class Contacto {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  public Long getId() {
    return id;
  }

  private String nombre;
  private String email;
  private String asunto;

  @Column(length = 2000)
  private String mensaje;

  private java.time.Instant fecha;

  public String getNombre() {
    return nombre;
  }

  public void setNombre(String nombre) {
    this.nombre = nombre;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getAsunto() {
    return asunto;
  }

  public void setAsunto(String asunto) {
    this.asunto = asunto;
  }

  public String getMensaje() {
    return mensaje;
  }

  public void setMensaje(String mensaje) {
    this.mensaje = mensaje;
  }

  public java.time.Instant getFecha() {
    return fecha;
  }

  public void setFecha(java.time.Instant fecha) {
    this.fecha = fecha;
  }
}
