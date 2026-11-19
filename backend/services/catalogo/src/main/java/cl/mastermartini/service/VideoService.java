package cl.mastermartini.service;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Videos: pesan demasiado para pasar por Java, así que el cliente (web o app) pide una URL firmada
 * y sube el archivo directo a S3. Después guarda la referencia /api/videos/... donde corresponda.
 */
@Service
public class VideoService {
  public static final long MAX_BYTES = 200L * 1024 * 1024;
  private static final Map<String, String> EXTENSION = Map.of("video/mp4", "mp4", "video/webm", "webm", "video/quicktime", "mov");
  private static final String NOMBRE = "[a-f0-9-]{36}\\.(mp4|webm|mov)";
  private static final Duration VIGENCIA = Duration.ofMinutes(15);
  private final AlmacenS3 s3;

  public VideoService(AlmacenS3 s3) { this.s3 = s3; }

  public record Subida(String subida, String metodo, Map<String, String> cabeceras, String url, long expiraEnSegundos) {}

  public Subida prepararSubida(String tipo, long tamano) {
    if (!s3.activo()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "La subida de videos requiere S3 (configura S3_BUCKET).");
    String ext = tipo == null ? null : EXTENSION.get(tipo.toLowerCase(java.util.Locale.ROOT));
    if (ext == null) throw invalid("Selecciona un video MP4, WEBM o MOV.");
    if (tamano < 1 || tamano > MAX_BYTES) throw invalid("El video debe pesar como máximo 200 MB.");
    String nombre = UUID.randomUUID() + "." + ext;
    String tipoNormal = tipo.toLowerCase(java.util.Locale.ROOT);
    String url = s3.firmarSubida("videos/" + nombre, tipoNormal, tamano, VIGENCIA);
    return new Subida(url, "PUT", Map.of("Content-Type", tipoNormal), "/api/videos/" + nombre, VIGENCIA.toSeconds());
  }

  public String urlPublica(String nombre) {
    if (!s3.activo() || !nombre.matches(NOMBRE)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    return s3.url("videos/" + nombre);
  }

  private ResponseStatusException invalid(String m) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, m); }
}
