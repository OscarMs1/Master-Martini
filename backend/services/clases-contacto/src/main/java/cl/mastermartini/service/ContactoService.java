package cl.mastermartini.service;
@org.springframework.stereotype.Service public class ContactoService{
 private final cl.mastermartini.repository.ContactoRepository repo;public ContactoService(cl.mastermartini.repository.ContactoRepository repo){this.repo=repo;}
 public Long guardar(cl.mastermartini.dto.ContactoRequest r){var c=new cl.mastermartini.model.Contacto();c.setNombre(r.nombre());c.setEmail(r.email());c.setAsunto(r.asunto());var mensaje=cl.mastermartini.service.HtmlSeguro.limpiar(r.mensaje());if(cl.mastermartini.service.HtmlSeguro.sinTexto(mensaje))throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,"El mensaje quedó vacío al quitar el formato no permitido.");c.setMensaje(mensaje);c.setFecha(java.time.Instant.now());return repo.saveAndFlush(c).getId();}
 public java.util.List<cl.mastermartini.model.Contacto> listar(){return repo.findAll();}
}
