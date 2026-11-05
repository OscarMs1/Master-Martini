package cl.mastermartini.controller;

import cl.mastermartini.dto.UsuarioResponse;
import cl.mastermartini.model.*;
import cl.mastermartini.repository.*;
import cl.mastermartini.service.*;
import java.util.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMINISTRADOR')")
public class AdminController {
  private final UsuarioRepository usuarios;
  private final PedidoService pedidos;
  private final ClaseService clases;
  private final ContactoRepository contactos;

  public AdminController(
      UsuarioRepository usuarios,
      PedidoService pedidos,
      ClaseService clases,
      ContactoRepository contactos) {
    this.usuarios = usuarios;
    this.pedidos = pedidos;
    this.clases = clases;
    this.contactos = contactos;
  }

  @GetMapping("/usuarios")
  public List<UsuarioResponse> usuarios() {
    return usuarios.findAll().stream().map(UsuarioResponse::from).toList();
  }

  @GetMapping("/pedidos")
  public List<Pedido> pedidos() {
    return pedidos.todos();
  }

  @GetMapping("/inscripciones")
  public List<Map<String, Object>> inscripciones() {
    return clases.todas();
  }

  @GetMapping("/contactos")
  public List<Contacto> contactos() {
    return contactos.findAll();
  }
}
