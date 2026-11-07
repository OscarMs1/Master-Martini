package cl.mastermartini.service;
import cl.mastermartini.dto.*;import java.util.*;import org.springframework.jdbc.core.JdbcTemplate;import org.springframework.stereotype.Service;import org.springframework.transaction.annotation.Transactional;import org.springframework.web.server.ResponseStatusException;import org.springframework.http.HttpStatus;import com.fasterxml.jackson.databind.ObjectMapper;
@Service public class ReservaService{
 private final JdbcTemplate jdbc;private final InventarioService stock;private final OfertaService ofertas;private final ObjectMapper mapper;
 public ReservaService(JdbcTemplate jdbc,InventarioService stock,OfertaService ofertas,ObjectMapper mapper){this.jdbc=jdbc;this.stock=stock;this.ofertas=ofertas;this.mapper=mapper;}
 @Transactional public ReservaResponse reservar(ReservaRequest r)throws Exception{
  if(r.items().stream().map(PedidoRequest.Item::id).distinct().count()!=r.items().size())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"No repitas productos.");
  String input=mapper.writeValueAsString(r);
  jdbc.update("INSERT IGNORE INTO reserva_inventario(clave,solicitud) VALUES(?,?)",r.key(),input);
  var saved=jdbc.queryForMap("SELECT solicitud,respuesta FROM reserva_inventario WHERE clave=? FOR UPDATE",r.key());
  if(!input.equals(saved.get("solicitud")))throw new ResponseStatusException(HttpStatus.CONFLICT,"La clave corresponde a otra solicitud.");
  if(saved.get("respuesta")!=null)return mapper.readValue((String)saved.get("respuesta"),ReservaResponse.class);
  long subtotal=0,descuento=0;var lines=new ArrayList<ReservaResponse.Linea>();
  for(var item:r.items().stream().sorted(Comparator.comparing(PedidoRequest.Item::id)).toList()){
   var p=stock.reservar(item.id(),item.cantidad(),r.descontar());long precio=ofertas.precioFinal(p);
   subtotal+=p.getPrecio()*item.cantidad();descuento+=(p.getPrecio()-precio)*item.cantidad();lines.add(new ReservaResponse.Linea(p.getId(),p.getNombre(),item.cantidad(),precio));
  }
  var result=new ReservaResponse(subtotal,descuento,lines);jdbc.update("UPDATE reserva_inventario SET respuesta=? WHERE clave=?",mapper.writeValueAsString(result),r.key());return result;
 }
}
