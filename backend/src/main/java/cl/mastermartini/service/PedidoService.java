package cl.mastermartini.service;

import cl.mastermartini.dto.PedidoRequest;
import cl.mastermartini.model.*;
import cl.mastermartini.repository.*;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PedidoService {
  private final PedidoRepository pedidos;
  private final ProductoRepository productos;
  private final UsuarioService usuarios;

  public PedidoService(
      PedidoRepository pedidos, ProductoRepository productos, UsuarioService usuarios) {
    this.pedidos = pedidos;
    this.productos = productos;
    this.usuarios = usuarios;
  }

  @Transactional
  public Pedido crear(PedidoRequest r, String email) {
    Reglas.validarRun(r.run());
    if (pedidos.existsByRequestKey(r.requestKey()))
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "Esta solicitud ya fue procesada. Revisa tus pedidos antes de repetirla.");
    if (r.items().stream().map(PedidoRequest.Item::id).distinct().count() != r.items().size())
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "No repitas un producto en el pedido.");
    Pedido p = new Pedido();
    p.setUsuarioId(email == null ? null : usuarios.obtener(email).getId());
    p.setRequestKey(r.requestKey());
    p.setFecha(Instant.now());
    p.setNombre(r.nombre());
    p.setEmail(r.email());
    p.setRun(r.run());
    p.setTelefono(r.telefono());
    p.setRegion(r.region());
    p.setComuna(r.comuna());
    p.setDireccion(r.direccion());
    p.setEntrega(r.entrega());
    p.setEstado(r.pago());
    long subtotal = 0, descuento = 0;
    // Siempre bloquear en orden de ID: evita sobreventa y reduce interbloqueos entre carritos.
    for (PedidoRequest.Item item :
        r.items().stream().sorted(Comparator.comparing(PedidoRequest.Item::id)).toList()) {
      Producto producto =
          productos
              .bloquear(item.id())
              .orElseThrow(
                  () ->
                      new ResponseStatusException(
                          HttpStatus.NOT_FOUND, "Un producto ya no está disponible."));
      if (producto.isRetirado()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no disponible.");
      if (producto.getStock() < item.cantidad())
        throw new ResponseStatusException(
            HttpStatus.CONFLICT, "Stock insuficiente para " + producto.getNombre() + ".");
      long precio = Math.round(producto.getPrecio() * (100 - producto.getDescuento()) / 100.0);
      subtotal += producto.getPrecio() * item.cantidad();
      descuento += (producto.getPrecio() - precio) * item.cantidad();
      p.getLineas()
          .add(new LineaPedido(producto.getId(), producto.getNombre(), item.cantidad(), precio));
      if (r.pago().equals("APROBADO")) producto.setStock(producto.getStock() - item.cantidad());
    }
    long despacho = r.entrega().equals("retiro") || subtotal - descuento >= 50000 ? 0 : 3990;
    p.setSubtotal(subtotal);
    p.setDescuento(descuento);
    p.setDespacho(despacho);
    p.setTotal(subtotal - descuento + despacho);
    return pedidos.saveAndFlush(p);
  }

  public List<Pedido> propios(String email) {
    return pedidos.findByUsuarioIdOrderByFechaDesc(usuarios.obtener(email).getId());
  }

  public List<Pedido> todos() {
    return pedidos.findAll(org.springframework.data.domain.Sort.by("fecha").descending());
  }
}
