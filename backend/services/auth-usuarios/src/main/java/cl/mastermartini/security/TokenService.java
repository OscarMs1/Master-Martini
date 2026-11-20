package cl.mastermartini.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;

/** Emite y valida los JWT (HS256) que usa la app móvil. La web sigue usando la sesión. */
@Component
public class TokenService {
  public static final String EMISOR = "master-martini";
  private final SecretKey key;
  private final JwtEncoder encoder;
  private final Duration duracion;
  private final Clock reloj;

  @org.springframework.beans.factory.annotation.Autowired
  public TokenService(@Value("${app.jwt-secret}") String secreto, @Value("${app.jwt-minutos:60}") long minutos) {
    this(secreto, minutos, Clock.systemUTC());
  }

  TokenService(String secreto, long minutos, Clock reloj) {
    if (secreto == null || secreto.getBytes(StandardCharsets.UTF_8).length < 32)
      throw new IllegalArgumentException("JWT_SECRET debe tener al menos 32 caracteres.");
    if (minutos < 1) throw new IllegalArgumentException("JWT_MINUTOS debe ser mayor que 0.");
    this.key = new SecretKeySpec(secreto.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    this.encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
    this.duracion = Duration.ofMinutes(minutos);
    this.reloj = reloj;
  }

  public JwtDecoder decoder() {
    NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(EMISOR));
    return decoder;
  }

  public long segundos() {
    return duracion.toSeconds();
  }

  public String emitir(String email, String rol, String passwordHash) {
    Instant ahora = reloj.instant();
    JwtClaimsSet claims = JwtClaimsSet.builder()
        .issuer(EMISOR)
        .subject(email)
        .issuedAt(ahora)
        .expiresAt(ahora.plus(duracion))
        .claim("rol", rol)
        .claim("pwv", versionPassword(passwordHash))
        .build();
    return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
  }

  /** Huella de la contraseña: al cambiarla, los tokens emitidos antes dejan de valer. */
  public String versionPassword(String passwordHash) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(key);
      byte[] h = mac.doFinal(passwordHash.getBytes(StandardCharsets.UTF_8));
      return Base64.getUrlEncoder().withoutPadding().encodeToString(h).substring(0, 22);
    } catch (java.security.GeneralSecurityException e) {
      throw new IllegalStateException(e);
    }
  }
}
