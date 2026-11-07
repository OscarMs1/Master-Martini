package cl.mastermartini.model;

import jakarta.persistence.*;

@Entity
public class Producto {
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

  @Column(nullable = false, length = 120)
  private String nombre;

  @Column(nullable = false, length = 30)
  private String categoria;

  @Column(nullable = false, length = 80)
  private String formato;

  @Column(nullable = false, length = 1500)
  private String descripcion;

  private long precio;
  private int descuento;
  private int stock;

  @Column(nullable = false, length = 200)
  private String imagen;

  private boolean destacado;

  public String getNombre() {
    return nombre;
  }

  public void setNombre(String nombre) {
    this.nombre = nombre;
  }

  public String getCategoria() {
    return categoria;
  }

  public void setCategoria(String categoria) {
    this.categoria = categoria;
  }

  public String getFormato() {
    return formato;
  }

  public void setFormato(String formato) {
    this.formato = formato;
  }

  public String getDescripcion() {
    return descripcion;
  }

  public void setDescripcion(String descripcion) {
    this.descripcion = descripcion;
  }

  public long getPrecio() {
    return precio;
  }

  public void setPrecio(long precio) {
    this.precio = precio;
  }

  public int getDescuento() {
    return descuento;
  }

  public void setDescuento(int descuento) {
    this.descuento = descuento;
  }

  public int getStock() {
    return stock;
  }

  public void setStock(int stock) {
    this.stock = stock;
  }

  public String getImagen() {
    return imagen;
  }

  public void setImagen(String imagen) {
    this.imagen = imagen;
  }

  public boolean getDestacado() {
    return destacado;
  }

  public void setDestacado(boolean destacado) {
    this.destacado = destacado;
  }
}
