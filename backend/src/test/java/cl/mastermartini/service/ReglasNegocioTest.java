package cl.mastermartini.service;
import cl.mastermartini.dto.PedidoRequest;
import cl.mastermartini.model.*;
import cl.mastermartini.repository.*;
import jakarta.validation.Validation;
import java.util.*;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.springframework.web.server.ResponseStatusException;
class ReglasNegocioTest {
 PedidoRequest pedido(int cantidad,String pago) { return new PedidoRequest(UUID.randomUUID().toString(),"Cliente Demo","demo@example.com","12.345.678-5","+56912345678","Metropolitana","Santiago","Calle 123","retiro",pago,List.of(new PedidoRequest.Item(1L,cantidad))); }
 @Test void runInvalido() { assertThrows(ResponseStatusException.class,()->Reglas.validarRun("12.345.678-0")); }
 @Test void cantidadNegativaNoValida() { try(var f=Validation.buildDefaultValidatorFactory()) { assertFalse(f.getValidator().validate(pedido(-1,"APROBADO")).isEmpty()); } }
 @Test void stockInsuficienteNoGuardaPedido() {
 var repo=mock(PedidoRepository.class); var productos=mock(ProductoRepository.class); var p=new Producto();p.setStock(1);p.setNombre("Prueba");when(productos.bloquear(1L)).thenReturn(Optional.of(p));
 var service=new PedidoService(repo,productos,mock(UsuarioService.class));assertThrows(ResponseStatusException.class,()->service.crear(pedido(2,"APROBADO"),null));verify(repo,never()).saveAndFlush(any());assertEquals(1,p.getStock());
 }
 @Test void pagoRechazadoNoDescuentaStock() {
 var repo=mock(PedidoRepository.class);var productos=mock(ProductoRepository.class);var p=new Producto();org.springframework.test.util.ReflectionTestUtils.setField(p,"id",1L);p.setNombre("Prueba");p.setPrecio(1000);p.setStock(5);when(productos.bloquear(1L)).thenReturn(Optional.of(p));when(repo.saveAndFlush(any())).thenAnswer(i->i.getArgument(0));
 var result=new PedidoService(repo,productos,mock(UsuarioService.class)).crear(pedido(2,"RECHAZADO"),null);assertEquals(5,p.getStock());assertEquals(2000,result.getTotal());
 }
 @Test void pagoAprobadoDescuentaStockYCalculaPrecioEnServidor() {
 var repo=mock(PedidoRepository.class);var productos=mock(ProductoRepository.class);var p=new Producto();org.springframework.test.util.ReflectionTestUtils.setField(p,"id",1L);p.setNombre("Prueba");p.setPrecio(1000);p.setDescuento(10);p.setStock(5);when(productos.bloquear(1L)).thenReturn(Optional.of(p));when(repo.saveAndFlush(any())).thenAnswer(i->i.getArgument(0));
 var result=new PedidoService(repo,productos,mock(UsuarioService.class)).crear(pedido(2,"APROBADO"),null);assertEquals(3,p.getStock());assertEquals(1800,result.getTotal());
 }
 @Test void inscripcionDuplicadaNoSeGuarda() {
 var clases=mock(ClaseRepository.class);var ins=mock(InscripcionRepository.class);var usuarios=mock(UsuarioService.class);var u=new Usuario();org.springframework.test.util.ReflectionTestUtils.setField(u,"id",1L);var c=new Clase();org.springframework.test.util.ReflectionTestUtils.setField(c,"id",2L);c.setFecha(Instant.now().plusSeconds(86400));c.setCapacidad(10);when(usuarios.obtener("demo")).thenReturn(u);when(clases.bloquear(2L)).thenReturn(Optional.of(c));when(ins.existsByUsuarioIdAndClaseId(1L,2L)).thenReturn(true);
 assertThrows(ResponseStatusException.class,()->new ClaseService(clases,ins,mock(ProductoRepository.class),usuarios).inscribir(2L,"demo"));verify(ins,never()).saveAndFlush(any());
 }
}
