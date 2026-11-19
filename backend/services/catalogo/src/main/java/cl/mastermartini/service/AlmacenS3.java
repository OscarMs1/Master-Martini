package cl.mastermartini.service;

import jakarta.annotation.PreDestroy;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

/**
 * Imágenes y videos en Amazon S3. Si S3_BUCKET está vacío queda desactivado y las imágenes se
 * guardan en disco como antes.
 *
 * <p>Las credenciales no se configuran aquí: el SDK las toma de la EC2 (en AWS Academy, el perfil
 * LabInstanceProfile), así no hay claves en el código ni en el .env.
 */
@Component
public class AlmacenS3 {
  private static final Logger log = LoggerFactory.getLogger(AlmacenS3.class);
  private final String bucket;
  private final String urlBase;
  private final S3Client s3;
  private final S3Presigner firmador;

  public AlmacenS3(
      @Value("${app.s3-bucket:}") String bucket,
      @Value("${app.s3-region:us-east-1}") String region,
      @Value("${app.media-base-url:}") String urlBase) {
    this.bucket = bucket.trim();
    if (this.bucket.isEmpty()) {
      this.urlBase = "";
      s3 = null;
      firmador = null;
      log.info("S3_BUCKET no configurado: las imágenes se guardan en disco.");
      return;
    }
    var r = Region.of(region);
    s3 = S3Client.builder().region(r).build();
    firmador = S3Presigner.builder().region(r).build();
    String base = urlBase.isBlank() ? "https://" + this.bucket + ".s3." + region + ".amazonaws.com" : urlBase.trim();
    this.urlBase = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
    log.info("Medios en S3: bucket {} servido desde {}", this.bucket, this.urlBase);
  }

  public boolean activo() {
    return s3 != null;
  }

  public void subir(String clave, byte[] datos, String tipo) {
    s3.putObject(
        PutObjectRequest.builder().bucket(bucket).key(clave).contentType(tipo).cacheControl("public, max-age=31536000, immutable").build(),
        RequestBody.fromBytes(datos));
  }

  public boolean existe(String clave) {
    try {
      s3.headObject(HeadObjectRequest.builder().bucket(bucket).key(clave).build());
      return true;
    } catch (NoSuchKeyException e) {
      return false;
    } catch (S3Exception e) {
      if (e.statusCode() == 404) return false;
      throw e;
    }
  }

  /** URL pública (bucket o CloudFront) desde la que la web y la app descargan el archivo. */
  public String url(String clave) {
    return urlBase + "/" + clave;
  }

  /** URL temporal para que el navegador o la app suba el archivo directo a S3 con un PUT. */
  public String firmarSubida(String clave, String tipo, long tamano, Duration vigencia) {
    // Content-Type y Content-Length quedan firmados: el cliente debe subir exactamente ese tipo y tamaño.
    var put = PutObjectRequest.builder().bucket(bucket).key(clave).contentType(tipo).contentLength(tamano).build();
    return firmador.presignPutObject(PutObjectPresignRequest.builder().signatureDuration(vigencia).putObjectRequest(put).build())
        .url().toString();
  }

  @PreDestroy
  void cerrar() {
    if (s3 != null) {
      s3.close();
      firmador.close();
    }
  }
}
