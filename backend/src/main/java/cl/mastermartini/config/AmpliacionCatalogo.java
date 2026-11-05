package cl.mastermartini.config;

import cl.mastermartini.model.*;
import cl.mastermartini.repository.*;
import java.time.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/** Adición idempotente: conserva los registros y las inscripciones existentes. */
@Component
@Order(10)
public class AmpliacionCatalogo implements CommandLineRunner {
  private final ProductoRepository productos;
  private final ClaseRepository clases;
  private final boolean enabled;
  public AmpliacionCatalogo(ProductoRepository productos, ClaseRepository clases,
      @Value("${app.seed-enabled}") boolean enabled) {
    this.productos = productos; this.clases = clases; this.enabled = enabled;
  }
  public void run(String... args) {
    if (!enabled) return;
    // Reemplaza solo las fotografías antiguas conocidas, nunca las subidas por el administrador.
    String[][] fotografias = {
      {"Croissant para hornear", "croissants", "croissant-producto"},
      {"Base para sorbete", "helado", "sorbete"},
      {"Bebida vegetal de soya", "cocina", "soya"},
      {"Crema culinaria", "cocina", "crema-culinaria"},
      {"Crema para batir", "pasteleria", "crema-batir"},
      {"Bebida vegetal de avena", "panaderia", "avena"},
      {"Pasta sabor pistacho", "gelateria", "pistacho"},
      {"Margarina de horneo", "panaderia", "margarina-horneo"}
    };
    for (String[] foto : fotografias) for (Producto producto : productos.findAll()) {
      if (producto.getNombre().equals(foto[0]) && producto.getImagen().equals("/assets/images/"+foto[1]+".jpg")) {
        producto.setImagen("/assets/images/"+foto[2]+".jpg"); productos.save(producto);
      }
    }
    String[][] nuevos = {
      {"Pasta de avellana", "gelateria", "500 g", "11990", "18", "avellanas", "Pasta para aportar sabor a avellanas a helados, rellenos y cremas."},
      {"Relleno de frutos rojos", "panaderia", "1 kg", "7490", "24", "frutos-rojos", "Relleno de frutos rojos para tartas, capas de torta y piezas de pastelería."},
      {"Preparado para muffins", "panaderia", "1 kg", "5490", "28", "muffins", "Mezcla base para preparar muffins y combinar con frutas o chocolate."},
      {"Crema de limón", "panaderia", "500 g", "6290", "20", "limon", "Crema de limón para rellenar tartaletas, postres en vaso y bizcochos."},
      {"Mejorante para panificación", "food-service", "500 g", "4990", "22", "mejorante", "Ingrediente de apoyo para masas de panificación; seguir la dosificación de la ficha del insumo."}
    };
    for (String[] d : nuevos) {
      if (productos.findAll().stream().anyMatch(p -> p.getNombre().equalsIgnoreCase(d[0]))) continue;
      Producto p = new Producto(); p.setNombre(d[0]); p.setCategoria(d[1]); p.setFormato(d[2]);
      p.setPrecio(Long.parseLong(d[3])); p.setStock(Integer.parseInt(d[4]));
      p.setImagen(RenovacionIngredientes.rutaInicial(d[0], d[5])); p.setDescripcion(d[6]);
      p.setDescuento(0); p.setDestacado(false); productos.save(p);
    }
    String[][] actividades = {
      {"Masas fermentadas: del amasado al horno", "Practica amasado, reposos y formado para comprender el desarrollo de una masa fermentada.", "clase-masas", "Presencial", "Intermedio", "3 horas", "16", "Mejorante para panificación"},
      {"Postres de limón y merengue", "Combina crema de limón y merengue para crear un postre de texturas equilibradas.", "clase-postres", "Online", "Intermedio", "2 horas", "24", "Pasta de avellana,Crema de limón"},
      {"Muffins: mezclado y horneado", "Aprende a dosificar, mezclar y controlar el horneado de muffins con distintos rellenos.", "clase-muffins", "Presencial", "Inicial", "2 horas", "14", "Preparado para muffins,Relleno de frutos rojos"},
      {"Tartaletas de frutas y cremas", "Trabaja bases de tartaleta, rellenos y terminaciones con fruta de temporada.", "clase-tartaletas", "Online", "Inicial", "90 minutos", "30", "Crema de limón,Relleno de frutos rojos"}
    };
    for (int i = 0; i < actividades.length; i++) {
      String[] d = actividades[i];
      if (clases.findAll().stream().anyMatch(c -> c.getTitulo().equalsIgnoreCase(d[0]))) continue;
      Clase c = new Clase(); c.setTitulo(d[0]); c.setDescripcion(d[1]);
      c.setImagen("/assets/images/" + d[2] + ".jpg"); c.setModalidad(d[3]); c.setNivel(d[4]);
      c.setDuracion(d[5]); c.setCapacidad(Integer.parseInt(d[6]));
      c.setLugar(d[3].equals("Online") ? "Aula virtual académica" : "Taller académico de Santiago (simulado)");
      c.setFecha(LocalDate.now(ZoneId.of("America/Santiago")).plusDays(42 + i * 7).atTime(15, 0).atZone(ZoneId.of("America/Santiago")).toInstant());
      c.setProductosIds(productos.findAll().stream().filter(p -> java.util.Arrays.asList(d[7].split(",")).contains(p.getNombre())).map(p -> p.getId().toString()).collect(java.util.stream.Collectors.joining(",")));
      clases.save(c);
    }
  }
}