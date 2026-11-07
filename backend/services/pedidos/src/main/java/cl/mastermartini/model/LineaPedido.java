package cl.mastermartini.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class LineaPedido {
  private Long productoId;
  private String nombre;
  private int cantidad;
  private long precioUnitario;

  protected LineaPedido() {}

  public LineaPedido(Long productoId, String nombre, int cantidad, long precioUnitario) {
    this.productoId = productoId;
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
  }

  public Long getProductoId() {
    return productoId;
  }

  public String getNombre() {
    return nombre;
  }

  public int getCantidad() {
    return cantidad;
  }

  public long getPrecioUnitario() {
    return precioUnitario;
  }
}
