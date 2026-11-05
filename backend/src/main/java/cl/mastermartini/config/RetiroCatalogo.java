package cl.mastermartini.config;
import cl.mastermartini.repository.*;
import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;
/** Baja idempotente: conserva entidades e historiales, sin modificar stock ni imágenes. */
@Component @Order(30)
public class RetiroCatalogo implements CommandLineRunner {
 private final ProductoRepository productos; private final ClaseRepository clases;
 public RetiroCatalogo(ProductoRepository p, ClaseRepository c) {productos=p;clases=c;}
 @Transactional public void run(String... args) {
  productos.findAll().stream().filter(p -> p.getNombre().equals("Margarina de horneo")).forEach(p -> p.setRetirado(true));
  productos.findAll().stream().filter(p -> p.getNombre().equals("Bebida vegetal de soya") && java.util.Set.of("/assets/images/soya.jpg", "/assets/images/cocina.jpg").contains(p.getImagen())).forEach(p -> p.setImagen("/assets/images/bebida-soya-real.jpg"));
  clases.findAll().stream().filter(c -> c.getTitulo().equals("Decoración de tortas modernas")).forEach(c -> c.setRetirado(true));
 }
}
