package cl.mastermartini.controller;
import cl.mastermartini.security.Actor;import cl.mastermartini.favorites.FavoritesController;import cl.mastermartini.reviews.ReviewsController;import cl.mastermartini.service.ProductoService;import org.springframework.web.bind.annotation.*;import org.springframework.http.HttpStatus;import org.springframework.web.server.ResponseStatusException;import jakarta.validation.Valid;import jakarta.validation.constraints.*;import java.util.*;
@RestController public class PreferenciasController{
 private final FavoritesController favorites;private final ReviewsController reviews;private final ProductoService productos;
 public PreferenciasController(FavoritesController favorites,ReviewsController reviews,ProductoService productos){this.favorites=favorites;this.reviews=reviews;this.productos=productos;}
 private long user(){Long id=Actor.id();if(id==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Inicia sesión para continuar.");return id;}
 @GetMapping("/api/favoritos")public Object favoritos(){return favorites.listar(user());}
 @PostMapping("/api/favoritos/{id}")public Object agregar(@PathVariable long id){productos.obtener(id);return favorites.guardar(new FavoritesController.FavoriteInput(user(),id));}
 @DeleteMapping("/api/favoritos/{id}")@ResponseStatus(HttpStatus.NO_CONTENT)public void quitar(@PathVariable long id){favorites.quitar(user(),id);}
 public record Opinion(@Min(1)@Max(5)int puntuacion,@NotBlank @Size(min=10,max=500)String comentario){}
 @GetMapping("/api/resenas/producto/{id}")public Object opiniones(@PathVariable long id){productos.obtener(id);var data=new LinkedHashMap<String,Object>(reviews.listar(id));var list=(List<Map<String,Object>>)data.get("opiniones");for(var row:list){row.put("mia",Objects.equals(row.remove("usuarioId"),Actor.id()));}return data;}
 @PostMapping("/api/resenas/producto/{id}")public Object opinar(@PathVariable long id,@Valid @RequestBody Opinion o,@RequestHeader(value="X-User-Name",defaultValue="Cliente")String name){productos.obtener(id);String nombre=java.net.URLDecoder.decode(name,java.nio.charset.StandardCharsets.UTF_8);String[] partes=nombre.trim().split("\s+");String autor=partes[0]+(partes.length>1?" "+partes[1].substring(0,1)+".":"");return reviews.guardar(new ReviewsController.ReviewInput(user(),id,autor.substring(0,Math.min(80,autor.length())),o.puntuacion(),o.comentario()));}
 @DeleteMapping("/api/resenas/{id}")@ResponseStatus(HttpStatus.NO_CONTENT)public void borrar(@PathVariable long id){reviews.quitar(id,user(),Actor.admin());}
}
