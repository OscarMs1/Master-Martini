package cl.mastermartini.service;
import org.junit.jupiter.api.Test;import org.springframework.jdbc.core.JdbcTemplate;import com.fasterxml.jackson.databind.ObjectMapper;import cl.mastermartini.dto.*;import java.util.*;
import static org.mockito.Mockito.*;import static org.junit.jupiter.api.Assertions.*;
class ReservaServiceTest{
 @Test void reintentoDevuelveReservaSinVolverADescontar()throws Exception{
  var jdbc=mock(JdbcTemplate.class);var stock=mock(InventarioService.class);var mapper=new ObjectMapper();var service=new ReservaService(jdbc,stock,new OfertaService(),mapper);
  var req=new ReservaRequest("12345678-1234-1234-1234-123456789012",true,List.of(new PedidoRequest.Item(1L,2)));
  var response=new ReservaResponse(1000,0,List.of(new ReservaResponse.Linea(1L,"Producto",2,500)));
  when(jdbc.queryForMap(anyString(),eq(req.key()))).thenReturn(Map.of("solicitud",mapper.writeValueAsString(req),"respuesta",mapper.writeValueAsString(response)));
  assertEquals(response,service.reservar(req));verifyNoInteractions(stock);
 }
 @Test void claveReutilizadaConOtroCarritoSeRechaza()throws Exception{
  var jdbc=mock(JdbcTemplate.class);var stock=mock(InventarioService.class);var service=new ReservaService(jdbc,stock,new OfertaService(),new ObjectMapper());
  var req=new ReservaRequest("12345678-1234-1234-1234-123456789012",true,List.of(new PedidoRequest.Item(1L,2)));
  when(jdbc.queryForMap(anyString(),eq(req.key()))).thenReturn(Map.of("solicitud","otra solicitud"));
  assertThrows(org.springframework.web.server.ResponseStatusException.class,()->service.reservar(req));verifyNoInteractions(stock);
 }
}
