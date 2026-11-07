package cl.mastermartini.controller;
@org.springframework.web.bind.annotation.RestController public class ReservaController{
 private final cl.mastermartini.service.ReservaService service;public ReservaController(cl.mastermartini.service.ReservaService service){this.service=service;}
 @org.springframework.web.bind.annotation.PostMapping("/internal/reservas") public cl.mastermartini.dto.ReservaResponse reservar(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody cl.mastermartini.dto.ReservaRequest r)throws Exception{return service.reservar(r);}
}
