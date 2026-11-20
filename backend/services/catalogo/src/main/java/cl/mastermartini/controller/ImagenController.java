package cl.mastermartini.controller;

import cl.mastermartini.service.ImagenService;
import cl.mastermartini.service.VideoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.io.IOException;
import java.net.URI;
import java.util.Map;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1")
public class ImagenController {
  private final ImagenService service;
  private final VideoService videos;
  public ImagenController(ImagenService service, VideoService videos) { this.service = service; this.videos = videos; }

  @PostMapping("/admin/imagenes")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, String> subir(@RequestParam("archivo") MultipartFile file) throws IOException {
    return Map.of("url", service.guardar(file));
  }

  @GetMapping("/imagenes/{name}")
  public ResponseEntity<Resource> obtener(@PathVariable String name) {
    // Con S3 la imagen la entrega el bucket o CloudFront, no este servicio.
    if (service.enS3()) return redirigir(service.urlS3(name));
    return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG)
      .header("X-Content-Type-Options", "nosniff")
      .header("Cache-Control", "public, max-age=86400")
      .body(new FileSystemResource(service.obtener(name)));
  }

  public record PedirSubidaVideo(@NotBlank String tipo, @Positive long tamano) {}

  /** Devuelve una URL firmada; el cliente hace PUT del video a esa URL con el Content-Type indicado. */
  @PostMapping("/admin/videos")
  @ResponseStatus(HttpStatus.CREATED)
  public VideoService.Subida subirVideo(@Valid @RequestBody PedirSubidaVideo r) {
    return videos.prepararSubida(r.tipo(), r.tamano());
  }

  @GetMapping("/videos/{name}")
  public ResponseEntity<Resource> video(@PathVariable String name) {
    return redirigir(videos.urlPublica(name));
  }

  private static <T> ResponseEntity<T> redirigir(String url) {
    return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(url)).header("Cache-Control", "public, max-age=86400").build();
  }
}
