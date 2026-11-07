package cl.mastermartini.service;
import cl.mastermartini.dto.*;import cl.mastermartini.model.*;import cl.mastermartini.repository.*;import cl.mastermartini.security.Actor;
import java.util.*;import java.time.Instant;import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;import org.springframework.jdbc.core.JdbcTemplate;import org.springframework.transaction.support.TransactionTemplate;import org.springframework.transaction.PlatformTransactionManager;import org.springframework.http.*;import org.springframework.web.server.ResponseStatusException;import org.springframework.beans.factory.annotation.Value;
@Service public class PedidoService {
 private final PedidoRepository pedidos;private final JdbcTemplate jdbc;private final ObjectMapper mapper;private final Remote remote;private final String catalog;private final TransactionTemplate tx;
 public PedidoService(PedidoRepository pedidos,JdbcTemplate jdbc,ObjectMapper mapper,Remote remote,@Value("${app.catalog-url}")String catalog,PlatformTransactionManager tm){this.pedidos=pedidos;this.jdbc=jdbc;this.mapper=mapper;this.remote=remote;this.catalog=catalog;tx=new TransactionTemplate(tm);}
 public Pedido crear(PedidoRequest r,String ignored){
  Reglas.validarRun(r.run());Ubicaciones.validar(r.region(),r.comuna());
  if(r.items().stream().map(PedidoRequest.Item::id).distinct().count()!=r.items().size())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"No repitas productos.");
  if(pedidos.existsByRequestKey(r.requestKey()))throw new ResponseStatusException(HttpStatus.CONFLICT,"Esta solicitud ya fue procesada.");
  String payload;try{payload=mapper.writeValueAsString(r);}catch(Exception e){throw new IllegalArgumentException(e);}
  Long actor=Actor.id();
  tx.executeWithoutResult(s->{
   jdbc.update("INSERT IGNORE INTO pedido_proceso(clave,solicitud,usuario_id,estado) VALUES(?,?,?,'PENDIENTE')",r.requestKey(),payload,actor);
   var row=jdbc.queryForMap("SELECT solicitud,usuario_id,estado FROM pedido_proceso WHERE clave=? FOR UPDATE",r.requestKey());
   if(!payload.equals(row.get("solicitud"))||!Objects.equals(actor,row.get("usuario_id"))||!row.get("estado").equals("PENDIENTE"))throw new ResponseStatusException(HttpStatus.CONFLICT,"Esta solicitud ya fue procesada. Revisa tus pedidos.");
  });
  return procesar(r.requestKey());
 }
 public Pedido procesar(String key){
  // El comando se confirma antes de contactar al catálogo. Si este proceso cae, se recupera al reiniciar.
  var result=tx.execute(status->{
   var row=jdbc.queryForMap("SELECT * FROM pedido_proceso WHERE clave=? FOR UPDATE",key);
   if(!row.get("estado").equals("PENDIENTE"))return null;
   PedidoRequest r;try{r=mapper.readValue((String)row.get("solicitud"),PedidoRequest.class);}catch(Exception e){throw new IllegalStateException(e);}
   ReservaResponse reserva;
   try{reserva=remote.call(catalog+"/internal/reservas",HttpMethod.POST,new ReservaRequest(key,r.pago().equals("APROBADO"),r.items()),ReservaResponse.class);}
   catch(ResponseStatusException e){if(e.getStatusCode().is4xxClientError()){jdbc.update("UPDATE pedido_proceso SET estado='FALLIDO',error=? WHERE clave=?",e.getReason(),key);return e;}throw e;}
   var p=new Pedido();p.setUsuarioId((Long)row.get("usuario_id"));p.setRequestKey(key);p.setFecha(Instant.now());p.setNombre(r.nombre());p.setEmail(r.email());p.setRun(r.run());p.setTelefono(r.telefono());p.setRegion(Ubicaciones.validar(r.region(),r.comuna()));p.setComuna(r.comuna());p.setDireccion(r.direccion());p.setEntrega(r.entrega());p.setEstado(r.pago());p.setSubtotal(reserva.subtotal());p.setDescuento(reserva.descuento());
   long envio=r.entrega().equals("retiro")||reserva.subtotal()-reserva.descuento()>=50000?0:3990;p.setDespacho(envio);p.setTotal(reserva.subtotal()-reserva.descuento()+envio);
   for(var l:reserva.lineas())p.getLineas().add(new LineaPedido(l.productoId(),l.nombre(),l.cantidad(),l.precioUnitario()));
   pedidos.saveAndFlush(p);jdbc.update("UPDATE pedido_proceso SET estado='COMPLETO' WHERE clave=?",key);return p;
  });
  if(result instanceof ResponseStatusException e)throw e;
  if(result==null)throw new ResponseStatusException(HttpStatus.CONFLICT,"Solicitud procesada. Revisa tus pedidos.");return (Pedido)result;
 }
 @org.springframework.scheduling.annotation.Scheduled(initialDelay=30000,fixedDelay=30000)
 public void recuperar(){for(String key:jdbc.queryForList("SELECT clave FROM pedido_proceso WHERE estado='PENDIENTE' ORDER BY creado LIMIT 50",String.class)){try{procesar(key);}catch(Exception e){org.slf4j.LoggerFactory.getLogger(getClass()).warn("Pedido pendiente: se volverá a comprobar en el siguiente ciclo.");}}}
 public List<Pedido> propios(String ignored){return pedidos.findByUsuarioIdOrderByFechaDesc(Actor.id());}
 public List<Pedido> todos(){return pedidos.findAll(org.springframework.data.domain.Sort.by("fecha").descending());}
}
