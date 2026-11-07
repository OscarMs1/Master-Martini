package cl.mastermartini.reviews;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@org.springframework.stereotype.Component
public class ReviewsController {
  private final JdbcTemplate jdbc;
  public ReviewsController(JdbcTemplate jdbc){this.jdbc=jdbc;}
  public record ReviewInput(@NotNull @Positive Long usuarioId,@NotNull @Positive Long productoId,
     @NotBlank @Size(max=80) String autor,@Min(1) @Max(5) int puntuacion,
     @NotBlank @Size(min=10,max=500) String comentario){}
   public ResponseEntity<?> estado(){
    try{jdbc.queryForObject("SELECT COUNT(*) FROM resena",Long.class);return ResponseEntity.ok(Map.of("estado","ok"));}
    catch(Exception e){return ResponseEntity.status(503).body(Map.of("estado","sin base de datos"));}
  }
  
  public Map<String,Object> listar(@PathVariable @Positive long productoId){
    List<Map<String,Object>> opiniones=jdbc.query(
      "SELECT id,usuario_id,autor,puntuacion,comentario,fecha FROM resena WHERE producto_id=? ORDER BY fecha DESC LIMIT 100",(rs,n)->{
      Map<String,Object> row=new LinkedHashMap<>();row.put("id",rs.getLong("id"));row.put("usuarioId",rs.getLong("usuario_id"));
      row.put("autor",rs.getString("autor"));row.put("puntuacion",rs.getInt("puntuacion"));
      row.put("comentario",rs.getString("comentario"));row.put("fecha",rs.getTimestamp("fecha").toInstant());return row;
    },productoId);
    Double promedio=jdbc.queryForObject("SELECT COALESCE(AVG(puntuacion),0) FROM resena WHERE producto_id=?",Double.class,productoId);
    Long total=jdbc.queryForObject("SELECT COUNT(*) FROM resena WHERE producto_id=?",Long.class,productoId);
    return Map.of("productoId",productoId,"promedio",promedio==null?0:promedio,"cantidad",total==null?0:total,"opiniones",opiniones);
  }
   @Transactional
  public Map<String,Object> guardar(@Valid @RequestBody ReviewInput in){
    String autor=in.autor().trim();String comentario=in.comentario().trim();
    if(autor.length()<2 || comentario.length()<10)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Revisa tu nombre y la opinión.");
    int count=jdbc.update("INSERT INTO resena(usuario_id,producto_id,autor,puntuacion,comentario,fecha) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE autor=VALUES(autor),puntuacion=VALUES(puntuacion),comentario=VALUES(comentario),fecha=CURRENT_TIMESTAMP",
      in.usuarioId(),in.productoId(),autor,in.puntuacion(),comentario);
    return Map.of("guardado",count>0,"productoId",in.productoId());
  }
   @ResponseStatus(HttpStatus.NO_CONTENT)
  public void quitar(@PathVariable @Positive long id,@RequestParam @Positive long usuarioId,@RequestParam(defaultValue="false") boolean administrador){
    int rows=administrador?jdbc.update("DELETE FROM resena WHERE id=?",id):jdbc.update("DELETE FROM resena WHERE id=? AND usuario_id=?",id,usuarioId);
    if(rows==0)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Reseña no encontrada o sin permiso.");
  }
}
