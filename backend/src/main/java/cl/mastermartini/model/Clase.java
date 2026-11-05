package cl.mastermartini.model;

import jakarta.persistence.*;

@Entity
public class Clase {
  @Column(nullable = false, columnDefinition = "boolean default false")
  private boolean retirado;
  public boolean isRetirado() { return retirado; }
  public void setRetirado(boolean value) { retirado = value; }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  public Long getId() {
    return id;
  }

  @Column(nullable = false)
  private String titulo;

  @Column(length = 1500)
  private String descripcion;

  @Column(nullable = false)
  private java.time.Instant fecha;

  private int capacidad;
  private String modalidad;
  private String lugar;
  private String duracion;
  private String nivel;
  private String imagen;
  private String productosIds;

  public String getTitulo() {
    return titulo;
  }

  public void setTitulo(String titulo) {
    this.titulo = titulo;
  }

  public String getDescripcion() {
    return descripcion;
  }

  public void setDescripcion(String descripcion) {
    this.descripcion = descripcion;
  }

  public java.time.Instant getFecha() {
    return fecha;
  }

  public void setFecha(java.time.Instant fecha) {
    this.fecha = fecha;
  }

  public int getCapacidad() {
    return capacidad;
  }

  public void setCapacidad(int capacidad) {
    this.capacidad = capacidad;
  }

  public String getModalidad() {
    return modalidad;
  }

  public void setModalidad(String modalidad) {
    this.modalidad = modalidad;
  }

  public String getLugar() {
    return lugar;
  }

  public void setLugar(String lugar) {
    this.lugar = lugar;
  }

  public String getDuracion() {
    return duracion;
  }

  public void setDuracion(String duracion) {
    this.duracion = duracion;
  }

  public String getNivel() {
    return nivel;
  }

  public void setNivel(String nivel) {
    this.nivel = nivel;
  }

  public String getImagen() {
    return imagen;
  }

  public void setImagen(String imagen) {
    this.imagen = imagen;
  }

  public String getProductosIds() {
    return productosIds;
  }

  public void setProductosIds(String productosIds) {
    this.productosIds = productosIds;
  }
}
