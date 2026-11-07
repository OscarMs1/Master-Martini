package cl.mastermartini.service;

import cl.mastermartini.model.Producto;
import org.springframework.stereotype.Service;

@Service
public class OfertaService {
  // El catálogo no agenda fechas: la oferta dura mientras el administrador mantenga el descuento.
  public boolean vigente(Producto producto) {
    return !producto.isRetirado() && producto.getDescuento() > 0;
  }
  public long precioFinal(Producto producto) {
    int descuento = vigente(producto) ? producto.getDescuento() : 0;
    return Math.round(producto.getPrecio() * (100 - descuento) / 100.0);
  }
}
