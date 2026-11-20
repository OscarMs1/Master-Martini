package cl.mastermartini.security;

import cl.mastermartini.model.RefreshToken;
import cl.mastermartini.repository.RefreshTokenRepository;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tokens de renovación con rotación: cada uso entrega uno nuevo y el anterior queda gastado.
 * Si alguien presenta un token ya gastado (fuera de un margen corto para pestañas simultáneas),
 * se asume robo y se revoca toda la familia: el ladrón y la víctima deben volver a iniciar sesión.
 */
@Service
public class RefreshTokenService {
  static final Duration GRACIA = Duration.ofSeconds(30);
  private static final java.util.regex.Pattern FORMATO = java.util.regex.Pattern.compile("[A-Za-z0-9_-]{43}");
  private final RefreshTokenRepository repo;
  private final Duration duracion;
  private final Clock reloj;
  private final SecureRandom random = new SecureRandom();

  public record Rotado(String email, String valor) {}

  @Autowired
  public RefreshTokenService(RefreshTokenRepository repo, @Value("${app.refresh-dias:7}") long dias) {
    this(repo, dias, Clock.systemUTC());
  }

  RefreshTokenService(RefreshTokenRepository repo, long dias, Clock reloj) {
    if (dias < 1) throw new IllegalArgumentException("REFRESH_DIAS debe ser mayor que 0.");
    this.repo = repo;
    this.duracion = Duration.ofDays(dias);
    this.reloj = reloj;
  }

  public Duration duracion() {
    return duracion;
  }

  /** Abre una familia nueva (un login). */
  @Transactional
  public String emitir(String email) {
    return emitir(email, UUID.randomUUID().toString());
  }

  private String emitir(String email, String familia) {
    byte[] bytes = new byte[32];
    random.nextBytes(bytes);
    String valor = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    repo.save(new RefreshToken(hash(valor), familia, email, reloj.instant().plus(duracion)));
    return valor;
  }

  /** Cambia un token válido por uno nuevo. Vacío si no sirve (no existe, venció, revocado o robado). */
  @Transactional
  public Optional<Rotado> rotar(String valor) {
    if (valor == null || !FORMATO.matcher(valor).matches()) return Optional.empty();
    var encontrado = repo.findByHash(hash(valor));
    if (encontrado.isEmpty()) return Optional.empty();
    RefreshToken t = encontrado.get();
    Instant ahora = reloj.instant();
    if (t.isRevocado() || !ahora.isBefore(t.getExpira())) return Optional.empty();
    if (t.getUsado() != null) {
      // Dos pestañas pueden renovar a la vez con la misma cookie: eso es normal unos segundos.
      if (ahora.isBefore(t.getUsado().plus(GRACIA))) return Optional.of(new Rotado(t.getEmail(), emitir(t.getEmail(), t.getFamilia())));
      repo.revocarFamilia(t.getFamilia());
      return Optional.empty();
    }
    t.setUsado(ahora);
    return Optional.of(new Rotado(t.getEmail(), emitir(t.getEmail(), t.getFamilia())));
  }

  /** Cerrar sesión: invalida el token y todos los que salieron de él. */
  @Transactional
  public void revocar(String valor) {
    if (valor == null || !FORMATO.matcher(valor).matches()) return;
    repo.findByHash(hash(valor)).ifPresent(t -> repo.revocarFamilia(t.getFamilia()));
  }

  /** Cierra todas las sesiones del usuario (por ejemplo, al cambiar la contraseña). */
  @Transactional
  public void revocarUsuario(String email) {
    repo.revocarEmail(email);
  }

  @Scheduled(cron = "0 17 4 * * *")
  @Transactional
  public void limpiar() {
    repo.borrarVencidos(reloj.instant().minus(Duration.ofDays(1)));
  }

  static String hash(String valor) {
    try {
      return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(valor.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }
}
