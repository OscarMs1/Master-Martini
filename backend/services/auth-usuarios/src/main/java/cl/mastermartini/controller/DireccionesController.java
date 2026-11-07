package cl.mastermartini.controller;
import cl.mastermartini.addresses.AddressesController;import cl.mastermartini.service.*;import java.util.*;import org.springframework.web.bind.annotation.*;import jakarta.validation.constraints.*;import jakarta.validation.Valid;
@RestController public class DireccionesController {
 private final AddressesController service;private final UsuarioService users;
 public DireccionesController(AddressesController service,UsuarioService users){this.service=service;this.users=users;}
 public record Input(@NotBlank @Size(min=2,max=40)String etiqueta,@NotBlank @Size(min=3,max=120)String nombre,@NotBlank @Email @Size(max=120)String email,@NotBlank @Size(max=15)String run,@NotBlank @Pattern(regexp="[+0-9 -]{8,16}")String telefono,@NotBlank String region,@NotBlank String comuna,@NotBlank @Size(min=5,max=200)String direccion){}
 @GetMapping("/api/direcciones") public Object listar(java.security.Principal p){return service.listar(users.obtener(p.getName()).getId());}
 @PostMapping("/api/direcciones") public Object guardar(@Valid @RequestBody Input d,java.security.Principal p){Reglas.validarRun(d.run());String region=Ubicaciones.validar(d.region(),d.comuna());return service.guardar(new AddressesController.AddressInput(users.obtener(p.getName()).getId(),d.etiqueta(),d.nombre(),d.email(),d.run(),d.telefono(),region,d.comuna(),d.direccion()));}
 @DeleteMapping("/api/direcciones/{id}") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)public void borrar(@PathVariable long id,java.security.Principal p){service.quitar(id,users.obtener(p.getName()).getId());}
}
