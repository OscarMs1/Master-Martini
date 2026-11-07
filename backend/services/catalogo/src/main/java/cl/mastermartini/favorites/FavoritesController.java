package cl.mastermartini.favorites;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@org.springframework.stereotype.Component
public class FavoritesController {
  private final JdbcTemplate jdbc;
  public FavoritesController(JdbcTemplate jdbc){this.jdbc=jdbc;}
  public record FavoriteInput(@NotNull @Positive Long usuarioId,@NotNull @Positive Long productoId){}
   public ResponseEntity<?> estado(){
    try {jdbc.queryForObject("SELECT COUNT(*) FROM favorito",Long.class); return ResponseEntity.ok(Map.of("estado","ok"));}
    catch(Exception e){return ResponseEntity.status(503).body(Map.of("estado","sin base de datos"));}
  }
   public List<Map<String,Object>> listar(@RequestParam @Positive long usuarioId){
    return jdbc.query("SELECT producto_id, fecha FROM favorito WHERE usuario_id=? ORDER BY fecha DESC",(rs,n)->{
      Map<String,Object> out=new LinkedHashMap<>();out.put("productoId",rs.getLong("producto_id"));out.put("fecha",rs.getTimestamp("fecha").toInstant());return out;
    },usuarioId);
  }
   @Transactional
  public Map<String,Object> guardar(@Valid @RequestBody FavoriteInput input){
    jdbc.update("INSERT INTO favorito (usuario_id,producto_id,fecha) VALUES (?,?,CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE fecha=fecha",input.usuarioId(),input.productoId());
    return Map.of("productoId",input.productoId(),"guardado",true);
  }
   @ResponseStatus(HttpStatus.NO_CONTENT)
  public void quitar(@RequestParam @Positive long usuarioId,@RequestParam @Positive long productoId){
    jdbc.update("DELETE FROM favorito WHERE usuario_id=? AND producto_id=?",usuarioId,productoId);
  }
}
