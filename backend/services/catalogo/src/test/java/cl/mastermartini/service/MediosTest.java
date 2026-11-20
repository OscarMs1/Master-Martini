package cl.mastermartini.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.*;
import java.time.Duration;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

class MediosTest {
  @TempDir Path dir;

  private MockMultipartFile png() throws Exception {
    var out = new ByteArrayOutputStream();
    ImageIO.write(new BufferedImage(4, 4, BufferedImage.TYPE_INT_RGB), "png", out);
    return new MockMultipartFile("archivo", "foto.png", "image/png", out.toByteArray());
  }

  @Test void sinBucketLaImagenQuedaEnDisco() throws Exception {
    var service = new ImagenService(dir.toString(), new AlmacenS3("", "us-east-1", ""));
    String ref = service.guardar(png());
    assertTrue(ref.startsWith("/api/v1/imagenes/"));
    assertFalse(service.enS3());
    assertTrue(Files.isRegularFile(service.obtener(ref.substring("/api/v1/imagenes/".length()))));
  }

  @Test void conBucketLaImagenSeSubeAS3YConservaLaReferencia() throws Exception {
    var s3 = mock(AlmacenS3.class);
    when(s3.activo()).thenReturn(true);
    when(s3.url(anyString())).thenAnswer(i -> "https://cdn.test/" + i.getArgument(0));
    var service = new ImagenService(dir.toString(), s3);
    String ref = service.guardar(png());
    String nombre = ref.substring("/api/v1/imagenes/".length());
    verify(s3).subir(eq("imagenes/" + nombre), any(), eq("image/png"));
    assertEquals("https://cdn.test/imagenes/" + nombre, service.urlS3(nombre));
    try (var archivos = Files.list(dir)) { assertEquals(0, archivos.count()); }
    when(s3.existe("imagenes/" + nombre)).thenReturn(false);
    assertThrows(ResponseStatusException.class, () -> service.validarReferencia(ref));
  }

  @Test void videoPideUrlFirmadaYValidaTipoYTamano() {
    var s3 = mock(AlmacenS3.class);
    when(s3.activo()).thenReturn(true);
    when(s3.firmarSubida(anyString(), anyString(), anyLong(), any(Duration.class))).thenReturn("https://bucket/firmada");
    var videos = new VideoService(s3);
    var subida = videos.prepararSubida("video/MP4", 1000);
    assertEquals("PUT", subida.metodo());
    assertEquals("video/mp4", subida.cabeceras().get("Content-Type"));
    assertTrue(subida.url().matches("/api/v1/videos/[a-f0-9-]{36}\\.mp4"));
    assertThrows(ResponseStatusException.class, () -> videos.prepararSubida("application/pdf", 1000));
    assertThrows(ResponseStatusException.class, () -> videos.prepararSubida("video/mp4", VideoService.MAX_BYTES + 1));
    assertThrows(ResponseStatusException.class, () -> videos.urlPublica("../secreto.mp4"));
  }

  @Test void sinBucketLosVideosNoEstanDisponibles() {
    var videos = new VideoService(new AlmacenS3("", "us-east-1", ""));
    var e = assertThrows(ResponseStatusException.class, () -> videos.prepararSubida("video/mp4", 1000));
    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, e.getStatusCode());
  }
}
