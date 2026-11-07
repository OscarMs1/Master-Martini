package cl.mastermartini.model;
import jakarta.persistence.*;
@Entity
public class Novedad {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
public Long getId(){return id;}
private String titulo;
public String getTitulo(){return titulo;}
public void setTitulo(String value){titulo=value;}
@Column(unique=true)
private String slug;
public String getSlug(){return slug;}
public void setSlug(String value){slug=value;}
private String bajada;
public String getBajada(){return bajada;}
public void setBajada(String value){bajada=value;}
@Column(length=15000)
private String contenido;
public String getContenido(){return contenido;}
public void setContenido(String value){contenido=value;}
private String imagen;
public String getImagen(){return imagen;}
public void setImagen(String value){imagen=value;}
private java.time.LocalDate fecha;
public java.time.LocalDate getFecha(){return fecha;}
public void setFecha(java.time.LocalDate value){fecha=value;}
private boolean publicado;
public boolean getPublicado(){return publicado;}
public void setPublicado(boolean value){publicado=value;}
}
