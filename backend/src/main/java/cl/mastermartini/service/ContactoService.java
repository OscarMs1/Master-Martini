package cl.mastermartini.service;

import cl.mastermartini.dto.ContactoRequest;
import cl.mastermartini.model.Contacto;
import cl.mastermartini.repository.ContactoRepository;
import org.springframework.stereotype.Service;

@Service
public class ContactoService {
  private final ContactoRepository repo;

  public ContactoService(ContactoRepository repo) {
    this.repo = repo;
  }

  public Long guardar(ContactoRequest r) {
    Contacto c = new Contacto();
    c.setNombre(r.nombre());
    c.setEmail(r.email());
    c.setAsunto(r.asunto());
    c.setMensaje(r.mensaje());
    c.setFecha(java.time.Instant.now());
    return repo.save(c).getId();
  }
}
