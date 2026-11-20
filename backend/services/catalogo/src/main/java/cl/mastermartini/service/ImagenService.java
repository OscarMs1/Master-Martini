package cl.mastermartini.service;

import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import javax.imageio.*;
import javax.imageio.stream.ImageInputStream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ImagenService {
  private static final String NOMBRE = "[a-f0-9-]{36}\\.png";
  private final Path root;
  private final AlmacenS3 s3;
  public ImagenService(@Value("${app.upload-directory}") String directory, AlmacenS3 s3) throws IOException {
    root = Path.of(directory).toAbsolutePath().normalize(); Files.createDirectories(root);
    this.s3 = s3;
  }
  public String guardar(MultipartFile file) throws IOException {
    if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024) throw invalid("La imagen debe pesar como máximo 5 MB.");
    String name = Objects.requireNonNullElse(file.getOriginalFilename(), "");
    if (name.length() > 180 || name.contains("/") || name.contains("\\") || !name.toLowerCase(Locale.ROOT).matches(".+\\.(jpg|jpeg|png|webp)"))
      throw invalid("Selecciona un archivo JPG, PNG o WEBP con nombre válido.");
    // Decodificar y reescribir elimina metadatos y contenido ajeno a la imagen.
    BufferedImage decoded;
    try (ImageInputStream input = ImageIO.createImageInputStream(file.getInputStream())) {
      Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
      if (!readers.hasNext()) throw invalid("El archivo no contiene una imagen válida.");
      ImageReader reader = readers.next();
      try {
        reader.setInput(input);
        String format = reader.getFormatName().toLowerCase(Locale.ROOT);
        if (!Set.of("jpeg", "jpg", "png", "webp").contains(format)) throw invalid("Formato no admitido.");
        int width = reader.getWidth(0), height = reader.getHeight(0);
        if (width < 1 || height < 1 || width > 10000 || height > 10000 || (long) width * height > 25000000)
          throw invalid("La imagen supera las dimensiones admitidas (25 megapíxeles).");
        decoded = reader.read(0);
      } finally { reader.dispose(); }
    } catch (IOException | IllegalArgumentException e) { throw invalid("No se pudo leer la imagen. Comprueba que no esté dañada."); }
    String internal = UUID.randomUUID() + ".png";
    var png = new ByteArrayOutputStream();
    if (!ImageIO.write(decoded, "png", png)) throw new IOException("No hay codificador PNG");
    if (s3.activo()) s3.subir("imagenes/" + internal, png.toByteArray(), "image/png");
    else Files.write(root.resolve(internal), png.toByteArray(), StandardOpenOption.CREATE_NEW);
    // La referencia es la misma en disco y en S3: con S3 activo, /api/imagenes/... redirige al bucket.
    return "/api/v1/imagenes/" + internal;
  }
  public boolean enS3() { return s3.activo(); }
  /** URL pública en S3 (o CloudFront) de una imagen subida. */
  public String urlS3(String name) {
    if (!name.matches(NOMBRE)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    return s3.url("imagenes/" + name);
  }
  public Path obtener(String name) {
    if (!name.matches(NOMBRE)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    Path path = root.resolve(name).normalize();
    if (!path.startsWith(root) || !Files.isRegularFile(path)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    return path;
  }
  public void validarReferencia(String path) {
    // Acepta también las referencias guardadas antes del versionado (/api/imagenes/...).
    var m = java.util.regex.Pattern.compile("/api/(?:v1/)?imagenes/(.+)").matcher(path);
    if (!m.matches()) return;
    String name = m.group(1);
    if (!s3.activo()) { obtener(name); return; }
    if (!name.matches(NOMBRE) || !s3.existe("imagenes/" + name)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
  }
  private ResponseStatusException invalid(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
}
