package cl.mastermartini.model;

import jakarta.persistence.*;

@Entity
public class Usuario {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  public Long getId() {
    return id;
  }

  @Column(nullable = false, length = 120)
  private String nombre;

  @Column(nullable = false, unique = true, length = 120)
  private String email;

  @com.fasterxml.jackson.annotation.JsonIgnore
  @Column(nullable = false)
  private String passwordHash;

  @Column(nullable = false, length = 20)
  private String rol;

  @Column(nullable = false, length = 15)
  private String run;

  @Column(nullable = false, length = 20)
  private String telefono;

  @Column(nullable = false, length = 120)
  private String region;

  @Column(nullable = false, length = 120)
  private String comuna;

  @Column(nullable = false, length = 200)
  private String direccion;

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

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public String getRol() {
    return rol;
  }

  public void setRol(String rol) {
    this.rol = rol;
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
}
