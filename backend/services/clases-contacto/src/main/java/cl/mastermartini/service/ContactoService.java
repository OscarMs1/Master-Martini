package cl.mastermartini.service;
@org.springframework.stereotype.Service public class ContactoService{
 private final cl.mastermartini.repository.ContactoRepository repo;public ContactoService(cl.mastermartini.repository.ContactoRepository repo){this.repo=repo;}
 public Long guardar(cl.mastermartini.dto.ContactoRequest r){var c=new cl.mastermartini.model.Contacto();c.setNombre(r.nombre());c.setEmail(r.email());c.setAsunto(r.asunto());c.setMensaje(r.mensaje());c.setFecha(java.time.Instant.now());return repo.saveAndFlush(c).getId();}
 public java.util.List<cl.mastermartini.model.Contacto> listar(){return repo.findAll();}
}
