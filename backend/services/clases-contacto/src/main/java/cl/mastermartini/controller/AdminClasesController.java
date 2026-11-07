package cl.mastermartini.controller;
@org.springframework.web.bind.annotation.RestController public class AdminClasesController{
 private final cl.mastermartini.service.ClaseService clases;private final cl.mastermartini.service.ContactoService contacto;
 public AdminClasesController(cl.mastermartini.service.ClaseService clases,cl.mastermartini.service.ContactoService contacto){this.clases=clases;this.contacto=contacto;}
 @org.springframework.web.bind.annotation.GetMapping("/api/admin/inscripciones") public Object inscripciones(){return clases.todas();}
 @org.springframework.web.bind.annotation.GetMapping("/api/admin/contactos") public Object contactos(){return contacto.listar();}
}
