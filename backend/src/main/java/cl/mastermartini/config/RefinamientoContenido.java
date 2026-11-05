package cl.mastermartini.config;
import cl.mastermartini.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
@Component @Order(60)
public class RefinamientoContenido implements CommandLineRunner {
  private final ProductoRepository productos; private final ClaseRepository clases;
  private final NovedadRepository novedades; private final ObjectMapper mapper;
  public RefinamientoContenido(ProductoRepository p, ClaseRepository c, NovedadRepository n, ObjectMapper m) {
    productos=p; clases=c; novedades=n; mapper=m;
  }
  @Override @Transactional
  public void run(String... args) throws Exception {
    try(var input=getClass().getResourceAsStream("/refinamiento-contenido.json")) {
      var data=mapper.readTree(input);
      for(var p:productos.findAll()) for(var update:data.get("productos")) {
        if(update.get("nombre").asText().equals(p.getNombre()) && update.get("anterior").asText().equals(p.getDescripcion()))
          p.setDescripcion(update.get("nuevo").asText());
      }
      String suffix=" Actividad académica de ejemplo, sin clase comercial real.";
      for(var c:clases.findAll()) {
        if(c.getDescripcion()!=null && c.getDescripcion().endsWith(suffix))
          c.setDescripcion(c.getDescripcion().substring(0,c.getDescripcion().length()-suffix.length()));
      }
      for(var n:novedades.findAll()) for(var update:data.get("novedades")) {
        if(update.get("slug").asText().equals(n.getSlug()) && update.get("anterior").asText().equals(n.getContenido()))
          n.setContenido(update.get("nuevo").asText());
      }
    }
  }
}
