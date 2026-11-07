package cl.mastermartini.service;

import cl.mastermartini.model.Producto;
import cl.mastermartini.repository.ProductoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Service
public class InventarioService {
  private final ProductoRepository productos;
  public InventarioService(ProductoRepository productos) { this.productos = productos; }

  // Participa en la misma transacción que el pedido: un fallo revierte todo el stock.
  @Transactional(propagation = Propagation.MANDATORY)
  public Producto reservar(Long id, int cantidad, boolean descontar) {
    if (cantidad < 1)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cantidad debe ser mayor que cero.");
    Producto producto = productos.bloquear(id).filter(p -> !p.isRetirado())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no disponible."));
    if (producto.getStock() < cantidad)
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Stock insuficiente para " + producto.getNombre() + ".");
    if (descontar) producto.setStock(producto.getStock() - cantidad);
    return producto;
  }
}
