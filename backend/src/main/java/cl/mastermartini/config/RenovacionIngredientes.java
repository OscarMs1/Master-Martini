package cl.mastermartini.config;

import cl.mastermartini.repository.ProductoRepository;
import java.util.List;
import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Actualiza exclusivamente rutas iniciales conocidas; nunca uploads, precios o existencias. */
@Component
@Order(40)
public class RenovacionIngredientes implements CommandLineRunner {
  private record Foto(String nombre, String archivo, Set<String> anteriores) {}
  private static final List<Foto> FOTOS = List.of(
      new Foto("Margarina para hojaldre", "https://mastermartini.cl/wp-content/uploads/2023/06/Margarinas-1.jpg", Set.of("croissants","panaderia","inicio-hojaldre","margarina-horneo")),
      new Foto("Crema para batir", "ingrediente-batir", Set.of("pasteleria","crema-batir","crema-montada")),
      new Foto("Cobertura de chocolate", "ingrediente-chocolate", Set.of("chocolate")),
      new Foto("Base para gelato", "gelateria", Set.of("helado","categoria-gelato")),
      new Foto("Crema para decoración", "ingrediente-decoracion", Set.of("pasteleria")),
      new Foto("Pasta sabor pistacho", "pistacho", Set.of("gelateria")),
      new Foto("Base para sorbete", "sorbete", Set.of("helado")),
      new Foto("Crema culinaria", "crema-culinaria", Set.of("cocina")),
      new Foto("Croissant para hornear", "ingrediente-croissant", Set.of("croissants","croissant-producto")),
      new Foto("Bebida vegetal de avena", "ingrediente-avena", Set.of("panaderia","avena")),
      new Foto("Bebida vegetal de soya", "bebida-soya-real", Set.of("cocina","soya")),
      new Foto("Pasta de avellana", "ingrediente-avellana", Set.of("avellanas")),
      new Foto("Relleno de frutos rojos", "ingrediente-frutos-rojos", Set.of("frutos-rojos")),
      new Foto("Preparado para muffins", "clase-muffins", Set.of("muffins")),
      new Foto("Crema de limón", "ingrediente-limon", Set.of("limon")),
      new Foto("Mejorante para panificación", "mejorante", Set.of("mejorante","panaderia")));
  private final ProductoRepository productos;
  public RenovacionIngredientes(ProductoRepository productos) { this.productos = productos; }
  public static String rutaInicial(String nombre, String archivo) {
    return FOTOS.stream().filter(f -> f.nombre().equals(nombre))
        .map(f -> ruta(f.archivo())).findFirst().orElse(ruta(archivo));
  }
  private static String ruta(String archivo) {
    // Se conserva el recurso original de Master Martini desde su sitio oficial.
    // Las fotografías locales restantes mantienen sus rutas habituales.
    return archivo.startsWith("https://") ? archivo : "/assets/images/" + archivo + ".jpg";
  }
  @Override
  @Transactional
  public void run(String... args) {
    for (var producto : productos.findAll()) {
      for (var foto : FOTOS) {
        if (foto.nombre().equals(producto.getNombre())
            && foto.anteriores().stream().map(RenovacionIngredientes::ruta)
                .anyMatch(anterior -> anterior.equals(producto.getImagen()))) {
          producto.setImagen(ruta(foto.archivo()));
        }
      }
    }
  }
}
