package cl.mastermartini.config;

import cl.mastermartini.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Image-only migration. Existing dates, seats, registrations and admin uploads remain intact. */
@Component
@Order(20)
public class RevisionFotografica implements CommandLineRunner {
  private final ProductoRepository productos;
  private final ClaseRepository clases;
  private final NovedadRepository novedades;
  private final boolean enabled;
  public RevisionFotografica(ProductoRepository productos, ClaseRepository clases,
      NovedadRepository novedades, @Value("${app.seed-enabled}") boolean enabled) {
    this.productos = productos; this.clases = clases; this.novedades = novedades; this.enabled = enabled;
  }
  private String ruta(String nombre) { return "/assets/images/" + nombre + ".jpg"; }
  @Transactional
  public void run(String... args) {
    if (!enabled) return;
    String[][] productosFotos = {
      {"Crema para batir", "crema-batir", "crema-montada"},
      {"Margarina de horneo", "margarina-horneo", "horneo-artesanal"}
    };
    for (var p : productos.findAll()) for (var foto : productosFotos) {
      if (p.getNombre().equals(foto[0]) && p.getImagen().equals(ruta(foto[1]))) {
        p.setImagen(ruta(foto[2])); productos.save(p);
      }
    }
    String[][] clasesFotos = {
      {"El arte del croissant", "croissants", "clase-croissant"},
      {"Gelato: textura y sabor", "gelateria", "clase-gelato"},
      {"Pastelería de pequeños detalles", "pasteleria", "clase-pasteleria"},
      {"El lenguaje del chocolate", "chocolate", "clase-chocolate"},
      {"Masas fermentadas: del amasado al horno", "clase-masas", "masas-luminosas"}
    };
    for (var c : clases.findAll()) for (var foto : clasesFotos) {
      if (c.getTitulo().equals(foto[0]) && c.getImagen().equals(ruta(foto[1]))) {
        c.setImagen(ruta(foto[2])); clases.save(c);
      }
    }
    String[][] noticiasFotos = {
      {"el-arte-del-laminado", "croissants", "editorial-laminado"},
      {"texturas-de-chocolate", "chocolate", "editorial-chocolate"},
      {"un-gelato-con-identidad", "helado", "editorial-gelato"}
    };
    for (var n : novedades.findAll()) for (var foto : noticiasFotos) {
      if (n.getSlug().equals(foto[0]) && n.getImagen().equals(ruta(foto[1]))) {
        n.setImagen(ruta(foto[2])); novedades.save(n);
      }
    }
  }
}
