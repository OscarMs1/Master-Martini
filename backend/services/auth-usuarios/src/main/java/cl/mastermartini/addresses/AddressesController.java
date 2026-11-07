package cl.mastermartini.addresses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@org.springframework.stereotype.Component
public class AddressesController {
  private final JdbcTemplate jdbc;
  public AddressesController(JdbcTemplate jdbc){this.jdbc=jdbc;}
  public record AddressInput(@NotNull @Positive Long usuarioId,
    @NotBlank @Size(min=2,max=40) String etiqueta,
    @NotBlank @Size(min=3,max=120) String nombre,
    @NotBlank @Email @Size(max=120) String email,
    @NotBlank @Size(max=15) String run,
    @NotBlank @Pattern(regexp="[+0-9 -]{8,16}") String telefono,
    @NotBlank @Size(max=120) String region,
    @NotBlank @Size(max=120) String comuna,
    @NotBlank @Size(min=5,max=200) String direccion){}
   public ResponseEntity<?> estado(){
    try{jdbc.queryForObject("SELECT COUNT(*) FROM direccion_guardada",Long.class);return ResponseEntity.ok(Map.of("estado","ok"));}
    catch(Exception e){return ResponseEntity.status(503).body(Map.of("estado","sin base de datos"));}
  }
   public List<Map<String,Object>> listar(@RequestParam @Positive long usuarioId){
    return jdbc.query("SELECT id,etiqueta,nombre,email,run,telefono,region,comuna,direccion FROM direccion_guardada WHERE usuario_id=? ORDER BY id DESC",(rs,n)->{
      Map<String,Object> row=new LinkedHashMap<>();
      for(String f:new String[]{"etiqueta","nombre","email","run","telefono","region","comuna","direccion"})row.put(f,rs.getString(f));
      row.put("id",rs.getLong("id"));return row;
    },usuarioId);
  }
   @Transactional
  public Map<String,Object> guardar(@Valid @RequestBody AddressInput in){
    // El bloqueo por usuario impide superar cinco direcciones mediante peticiones simultáneas.
    jdbc.update("INSERT IGNORE INTO direccion_bloqueo (usuario_id) VALUES (?)",in.usuarioId());
    jdbc.queryForObject("SELECT usuario_id FROM direccion_bloqueo WHERE usuario_id=? FOR UPDATE",Long.class,in.usuarioId());
    Long total=jdbc.queryForObject("SELECT COUNT(*) FROM direccion_guardada WHERE usuario_id=?",Long.class,in.usuarioId());
    if(total!=null && total>=5)throw new ResponseStatusException(HttpStatus.CONFLICT,"Puedes guardar hasta cinco direcciones.");
    jdbc.update("INSERT INTO direccion_guardada(usuario_id,etiqueta,nombre,email,run,telefono,region,comuna,direccion) VALUES(?,?,?,?,?,?,?,?,?)",
      in.usuarioId(),in.etiqueta().trim(),in.nombre().trim(),in.email().trim(),in.run().trim(),in.telefono().trim(),in.region().trim(),in.comuna().trim(),in.direccion().trim());
    return Map.of("guardado",true);
  }
   @ResponseStatus(HttpStatus.NO_CONTENT)
  public void quitar(@PathVariable @Positive long id,@RequestParam @Positive long usuarioId){
    if(jdbc.update("DELETE FROM direccion_guardada WHERE id=? AND usuario_id=?",id,usuarioId)==0)
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Dirección no encontrada.");
  }
}
