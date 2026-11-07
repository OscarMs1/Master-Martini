package cl.mastermartini.controller;
@org.springframework.web.bind.annotation.RestController public class AdminPedidosController{
 private final cl.mastermartini.service.PedidoService service;public AdminPedidosController(cl.mastermartini.service.PedidoService service){this.service=service;}
 @org.springframework.web.bind.annotation.GetMapping("/api/admin/pedidos")public java.util.List<cl.mastermartini.model.Pedido> listar(){return service.todos();}
}
