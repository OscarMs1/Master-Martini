package cl.mastermartini.config;
import cl.mastermartini.dto.NovedadRequest;
import cl.mastermartini.repository.NovedadRepository;
import cl.mastermartini.service.NovedadService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
@Component
public class SeedNovedades implements CommandLineRunner {
  private final ObjectMapper mapper; private final NovedadRepository repo; private final NovedadService service; private final boolean enabled;
  public SeedNovedades(ObjectMapper mapper,NovedadRepository repo,NovedadService service,@Value("${app.seed-enabled}") boolean enabled){this.mapper=mapper;this.repo=repo;this.service=service;this.enabled=enabled;}
  public void run(String... args) throws Exception {
    if(!enabled)return;
    try(var input=getClass().getResourceAsStream("/novedades-iniciales.json")) {
      for(NovedadRequest n:mapper.readValue(input,NovedadRequest[].class)) if(!repo.existsBySlug(n.slug())) service.guardar(null,n);
    }
  }
}
