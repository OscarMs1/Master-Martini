package cl.mastermartini.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import cl.mastermartini.model.Producto;
import cl.mastermartini.repository.*;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class ProductoServiceTest {
  final ProductoRepository productos = mock(ProductoRepository.class);
  final FavoritoRepository favoritos = mock(FavoritoRepository.class);
  final ResenaRepository resenas = mock(ResenaRepository.class);
  final ProductoService service =
      new ProductoService(productos, mock(ImagenService.class), favoritos, resenas);

  @Test void eliminarBorraPrimeroFavoritosYOpinionesDelProducto() {
    var producto = new Producto();
    when(productos.bloquear(7L)).thenReturn(Optional.of(producto));
    service.eliminar(7L);
    // Si el producto se borrara antes, la llave foránea de favoritos y opiniones lo impediría (409).
    var orden = inOrder(favoritos, resenas, productos);
    orden.verify(favoritos).borrarDeProducto(7L);
    orden.verify(resenas).borrarDeProducto(7L);
    orden.verify(productos).delete(producto);
  }

  @Test void eliminarUnProductoInexistenteDa404SinBorrarNada() {
    when(productos.bloquear(99L)).thenReturn(Optional.empty());
    var e = assertThrows(ResponseStatusException.class, () -> service.eliminar(99L));
    assertEquals(HttpStatus.NOT_FOUND, e.getStatusCode());
    verifyNoInteractions(favoritos, resenas);
  }
}
