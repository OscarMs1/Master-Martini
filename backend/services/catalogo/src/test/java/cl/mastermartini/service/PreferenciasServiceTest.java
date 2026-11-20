package cl.mastermartini.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import cl.mastermartini.model.*;
import cl.mastermartini.repository.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

class PreferenciasServiceTest {
  final FavoritoRepository favoritos = mock(FavoritoRepository.class);
  final ResenaRepository resenas = mock(ResenaRepository.class);
  final FavoritoService favoritoService = new FavoritoService(favoritos);
  final ResenaService resenaService = new ResenaService(resenas);
  final Producto producto = new Producto();

  @BeforeEach
  void preparar() {
    ReflectionTestUtils.setField(producto, "id", 5L);
  }

  @Test void favoritoQuedaRelacionadoAlProductoYNoSeDuplica() {
    when(favoritos.findByUsuarioIdAndProducto_Id(42L, 5L)).thenReturn(Optional.empty());
    favoritoService.guardar(42L, producto);
    verify(favoritos).save(argThat(f -> f.getProducto() == producto && f.getUsuarioId() == 42L));
    when(favoritos.findByUsuarioIdAndProducto_Id(42L, 5L)).thenReturn(Optional.of(new Favorito(42L, producto, null)));
    favoritoService.guardar(42L, producto);
    verify(favoritos, times(1)).save(any());
  }

  @Test void listarFavoritosDevuelveElIdDelProducto() {
    when(favoritos.findByUsuarioIdOrderByFechaDesc(42L)).thenReturn(List.of(new Favorito(42L, producto, java.time.Instant.now())));
    assertEquals(5L, favoritoService.listar(42L).get(0).get("productoId"));
  }

  @Test void segundaResenaDelMismoClienteReemplazaLaAnterior() {
    var existente = new Resena(42L, producto);
    existente.actualizar("Ana P.", 2, "No me gustó mucho el resultado.", java.time.Instant.now());
    when(resenas.findByUsuarioIdAndProducto_Id(42L, 5L)).thenReturn(Optional.of(existente));
    resenaService.guardar(42L, producto, "Ana P.", 5, "Ahora sí quedó perfecto, muy buena.");
    verify(resenas).save(existente);
    assertEquals(5, existente.getPuntuacion());
  }

  @Test void resenaInvalidaSeRechaza() {
    assertThrows(ResponseStatusException.class, () -> resenaService.guardar(42L, producto, "Ana", 5, "corta"));
    assertThrows(ResponseStatusException.class, () -> resenaService.guardar(42L, producto, "Ana", 6, "Comentario suficientemente largo."));
    verify(resenas, never()).save(any());
  }

  @Test void soloElAutorOUnAdminBorranUnaResena() {
    var r = new Resena(42L, producto);
    when(resenas.findById(9L)).thenReturn(Optional.of(r));
    var e = assertThrows(ResponseStatusException.class, () -> resenaService.quitar(9L, 7L, false));
    assertEquals(HttpStatus.NOT_FOUND, e.getStatusCode());
    resenaService.quitar(9L, 7L, true);
    resenaService.quitar(9L, 42L, false);
    verify(resenas, times(2)).delete(r);
  }

  @Test void marcaComoMiaLaResenaDeQuienConsulta() {
    var mia = new Resena(42L, producto);
    mia.actualizar("Ana P.", 4, "Muy buena textura y sabor.", java.time.Instant.now());
    when(resenas.findTop100ByProducto_IdOrderByFechaDesc(5L)).thenReturn(List.of(mia));
    when(resenas.promedio(5L)).thenReturn(4.0);
    when(resenas.countByProducto_Id(5L)).thenReturn(1L);
    var data = resenaService.listar(5L, 42L);
    var opiniones = (List<Map<String, Object>>) data.get("opiniones");
    assertEquals(true, opiniones.get(0).get("mia"));
    assertFalse(opiniones.get(0).containsKey("usuarioId"));
    assertEquals(4.0, data.get("promedio"));
  }
}
