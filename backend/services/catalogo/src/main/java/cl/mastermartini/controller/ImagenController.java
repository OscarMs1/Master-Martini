package cl.mastermartini.controller;

import cl.mastermartini.service.ImagenService;
import java.io.IOException;
import java.util.Map;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class ImagenController {
  private final ImagenService service;
  public ImagenController(ImagenService service) { this.service = service; }
  @PostMapping("/admin/imagenes")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, String> subir(@RequestParam("archivo") MultipartFile file) throws IOException {
    return Map.of("url", service.guardar(file));
  }
  @GetMapping("/imagenes/{name}")
  public ResponseEntity<Resource> obtener(@PathVariable String name) {
    return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG)
      .header("X-Content-Type-Options", "nosniff")
      .header("Cache-Control", "public, max-age=86400")
      .body(new FileSystemResource(service.obtener(name)));
  }
}
