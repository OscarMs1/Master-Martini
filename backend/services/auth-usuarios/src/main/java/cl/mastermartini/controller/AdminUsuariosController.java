package cl.mastermartini.controller;
@org.springframework.web.bind.annotation.RestController public class AdminUsuariosController {
 private final cl.mastermartini.repository.UsuarioRepository repo;
 public AdminUsuariosController(cl.mastermartini.repository.UsuarioRepository repo){this.repo=repo;}
 @org.springframework.web.bind.annotation.GetMapping("/api/admin/usuarios") public java.util.List<cl.mastermartini.dto.UsuarioResponse> listar(){return repo.findAll().stream().map(cl.mastermartini.dto.UsuarioResponse::from).toList();}
}
