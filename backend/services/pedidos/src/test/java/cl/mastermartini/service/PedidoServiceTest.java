package cl.mastermartini.service;

import cl.mastermartini.dto.PedidoRequest;
import cl.mastermartini.repository.PedidoRepository;
import cl.mastermartini.model.Pedido;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PedidoServiceTest {
  private final PedidoRepository pedidos = mock(PedidoRepository.class);
  private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
  private final Remote remoto = mock(Remote.class);
  private final PedidoService service = new PedidoService(
      pedidos, jdbc, new ObjectMapper(), remoto, "http://catalogo:8080", mock(PlatformTransactionManager.class));

  private PedidoRequest solicitud(String run, List<PedidoRequest.Item> items) {
    return new PedidoRequest("01234567-89ab-cdef-0123-456789abcdef",
        "Cliente Prueba", "cliente@demo.local", run, "+56912345678", "Metropolitana", "Santiago",
        "Calle de Prueba 123", "domicilio", "APROBADO", items);
  }

  @AfterEach void limpiar() { SecurityContextHolder.clearContext(); }

  @Test void noAceptaRunInvalidoNiReservaInventario() {
    var error = assertThrows(ResponseStatusException.class,
        () -> service.crear(solicitud("12.345.678-0", List.of(new PedidoRequest.Item(1L, 1))), null));
    assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
    verifyNoInteractions(remoto, jdbc);
  }

  @Test void rechazaProductosDuplicadosAntesDeProcesar() {
    var error = assertThrows(ResponseStatusException.class,
        () -> service.crear(solicitud("12.345.678-5", List.of(
            new PedidoRequest.Item(1L, 1), new PedidoRequest.Item(1L, 2))), null));
    assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
    verifyNoInteractions(remoto, jdbc);
  }

  @Test void mismaClaveNoGeneraDosPedidos() {
    when(pedidos.existsByRequestKey("01234567-89ab-cdef-0123-456789abcdef")).thenReturn(true);
    var error = assertThrows(ResponseStatusException.class,
        () -> service.crear(solicitud("12.345.678-5", List.of(new PedidoRequest.Item(1L, 1))), null));
    assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
    verifyNoInteractions(remoto, jdbc);
  }

  @Test void historialFiltradoPorUsuarioAutenticado() {
    SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("42", "-"));
    var historial = List.of(new Pedido());
    when(pedidos.findByUsuarioIdOrderByFechaDesc(42L)).thenReturn(historial);
    assertSame(historial, service.propios("no-se-usa"));
    verify(pedidos).findByUsuarioIdOrderByFechaDesc(42L);
  }

  @Test void recuperacionSinPendientesNoContactaCatalogo() {
    when(jdbc.queryForList(anyString(), eq(String.class))).thenReturn(List.of());
    assertDoesNotThrow(service::recuperar);
    verifyNoInteractions(remoto);
  }
}
