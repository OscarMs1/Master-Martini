package cl.mastermartini.model;

import jakarta.persistence.*;

@Entity
public class Pedido {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  public Long getId() {
    return id;
  }

  private Long usuarioId;

  @Column(nullable = false, unique = true, length = 36)
  private String requestKey;

  @Column(nullable = false)
  private java.time.Instant fecha;

  private String nombre;
  private String email;
  private String run;
  private String telefono;
  private String region;
  private String comuna;
  private String direccion;
  private String entrega;
  private String estado;
  private long subtotal;
  private long descuento;
  private long despacho;
  private long total;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "pedido_lineas", joinColumns = @JoinColumn(name = "pedido_id"))
  private java.util.List<LineaPedido> lineas = new java.util.ArrayList<>();

  public Long getUsuarioId() {
    return usuarioId;
  }

  public void setUsuarioId(Long usuarioId) {
    this.usuarioId = usuarioId;
  }

  public String getRequestKey() {
    return requestKey;
  }

  public void setRequestKey(String requestKey) {
    this.requestKey = requestKey;
  }

  public java.time.Instant getFecha() {
    return fecha;
  }

  public void setFecha(java.time.Instant fecha) {
    this.fecha = fecha;
  }

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

  public String getRun() {
    return run;
  }

  public void setRun(String run) {
    this.run = run;
  }

  public String getTelefono() {
    return telefono;
  }

  public void setTelefono(String telefono) {
    this.telefono = telefono;
  }

  public String getRegion() {
    return region;
  }

  public void setRegion(String region) {
    this.region = region;
  }

  public String getComuna() {
    return comuna;
  }

  public void setComuna(String comuna) {
    this.comuna = comuna;
  }

  public String getDireccion() {
    return direccion;
  }

  public void setDireccion(String direccion) {
    this.direccion = direccion;
  }

  public String getEntrega() {
    return entrega;
  }

  public void setEntrega(String entrega) {
    this.entrega = entrega;
  }

  public String getEstado() {
    return estado;
  }

  public void setEstado(String estado) {
    this.estado = estado;
  }

  public long getSubtotal() {
    return subtotal;
  }

  public void setSubtotal(long subtotal) {
    this.subtotal = subtotal;
  }

  public long getDescuento() {
    return descuento;
  }

  public void setDescuento(long descuento) {
    this.descuento = descuento;
  }

  public long getDespacho() {
    return despacho;
  }

  public void setDespacho(long despacho) {
    this.despacho = despacho;
  }

  public long getTotal() {
    return total;
  }

  public void setTotal(long total) {
    this.total = total;
  }

  public java.util.List<LineaPedido> getLineas() {
    return lineas;
  }

  public void setLineas(java.util.List<LineaPedido> lineas) {
    this.lineas = lineas;
  }
}
