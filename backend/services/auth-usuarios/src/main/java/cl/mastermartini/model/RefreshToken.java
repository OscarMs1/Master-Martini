package cl.mastermartini.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Token de renovación. Solo se guarda su hash SHA-256: si alguien lee la base de datos no puede
 * usarlos. Cada login abre una "familia"; cada renovación crea un token nuevo en la misma familia.
 */
@Entity
@Table(name = "refresh_token", indexes = {@Index(columnList = "familia"), @Index(columnList = "email")})
public class RefreshToken {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 64)
  private String hash;

  @Column(nullable = false, length = 36)
  private String familia;

  @Column(nullable = false, length = 120)
  private String email;

  @Column(nullable = false)
  private Instant expira;

  /** Momento en que se cambió por uno nuevo; null si aún no se usa. */
  private Instant usado;

  @Column(nullable = false)
  private boolean revocado;

  protected RefreshToken() {}

  public RefreshToken(String hash, String familia, String email, Instant expira) {
    this.hash = hash;
    this.familia = familia;
    this.email = email;
    this.expira = expira;
  }

  public String getHash() { return hash; }
  public String getFamilia() { return familia; }
  public String getEmail() { return email; }
  public Instant getExpira() { return expira; }
  public Instant getUsado() { return usado; }
  public void setUsado(Instant usado) { this.usado = usado; }
  public boolean isRevocado() { return revocado; }
  public void setRevocado(boolean revocado) { this.revocado = revocado; }
}
