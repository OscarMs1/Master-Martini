package cl.mastermartini.dto;
import java.util.List;
public record ReservaResponse(long subtotal,long descuento,List<Linea> lineas){public record Linea(Long productoId,String nombre,int cantidad,long precioUnitario){}}
