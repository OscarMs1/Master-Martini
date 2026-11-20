package cl.mastermartini.controller;
import cl.mastermartini.service.UsuarioService;
import jakarta.servlet.http.*;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestClient;
@io.swagger.v3.oas.annotations.Hidden @RestController public class GatewayController {
 private final UsuarioService users;private final String catalog,orders,classes,key;private final RestClient client;
 private final cl.mastermartini.security.IpCliente ipCliente;
 public GatewayController(cl.mastermartini.security.IpCliente ipCliente,UsuarioService users,@Value("${app.catalog-url}")String catalog,@Value("${app.orders-url}")String orders,@Value("${app.classes-url}")String classes,@Value("${app.service-key}")String key){
  this.ipCliente=ipCliente;this.users=users;this.catalog=catalog;this.orders=orders;this.classes=classes;this.key=key;
  // Las redirecciones (imágenes y videos en S3) se devuelven al cliente; el gateway no las sigue.
  var f=new org.springframework.http.client.SimpleClientHttpRequestFactory(){@Override protected void prepareConnection(java.net.HttpURLConnection c,String m)throws java.io.IOException{super.prepareConnection(c,m);c.setInstanceFollowRedirects(false);}};f.setConnectTimeout(2000);f.setReadTimeout(15000);client=RestClient.builder().requestFactory(f).build();
 }
 @RequestMapping({"/api/v1/productos","/api/v1/productos/**","/api/v1/imagenes/**","/api/v1/novedades","/api/v1/novedades/**","/api/v1/pedidos","/api/v1/pedidos/**","/api/v1/clases","/api/v1/inscripciones/**","/api/v1/inscripciones","/api/v1/contactos","/api/v1/asistente","/api/v1/admin/pedidos","/api/v1/admin/inscripciones","/api/v1/admin/contactos","/api/v1/admin/novedades","/api/v1/admin/novedades/**","/api/v1/admin/imagenes","/api/v1/admin/videos","/api/v1/videos/**","/api/imagenes/**","/api/videos/**","/api/v1/favoritos/**","/api/v1/favoritos","/api/v1/resenas/**"})
 public ResponseEntity<byte[]> proxy(HttpServletRequest r)throws java.io.IOException {
  String path=r.getRequestURI();
  // Compatibilidad: imágenes y videos guardados antes del versionado apuntan a /api/imagenes y /api/videos.
  if(path.startsWith("/api/imagenes/")||path.startsWith("/api/videos/"))path="/api/v1"+path.substring(4);
  String target=path.startsWith("/api/v1/pedidos")||path.equals("/api/v1/admin/pedidos")?orders:
   path.startsWith("/api/v1/clases")||path.startsWith("/api/v1/inscripciones")||path.equals("/api/v1/contactos")||path.equals("/api/v1/asistente")||path.equals("/api/v1/admin/inscripciones")||path.equals("/api/v1/admin/contactos")?classes:catalog;
  var req=client.method(HttpMethod.valueOf(r.getMethod())).uri(target+path+(r.getQueryString()==null?"":"?"+r.getQueryString())).header("X-Service-Key",key);
  if(r.getUserPrincipal()!=null){var u=users.obtener(r.getUserPrincipal().getName());req.header("X-User-Id",u.getId().toString()).header("X-User-Role",u.getRol()).header("X-User-Name",java.net.URLEncoder.encode(u.getNombre(),java.nio.charset.StandardCharsets.UTF_8));}
  // nginx agrega la IP real al final de X-Forwarded-For; los valores anteriores los puede inventar el cliente.
  if(path.equals("/api/v1/asistente")){req.header("X-Client-Ip",ipCliente.de(r));}
  if(r.getContentType()!=null)req.header("Content-Type",r.getContentType());
  byte[] body=r.getInputStream().readNBytes(6*1024*1024+1);if(body.length>6*1024*1024)return ResponseEntity.status(413).build();if(body.length>0)req.body(body);
  try{return req.exchange((request,response)->{var headers=new HttpHeaders();for(String name:List.of("Content-Type","Location","Cache-Control","X-Content-Type-Options")){var value=response.getHeaders().get(name);if(value!=null)headers.put(name,value);}return new ResponseEntity<>(response.getBody().readAllBytes(),headers,response.getStatusCode());});}
  catch(org.springframework.web.client.RestClientException e){return ResponseEntity.status(503).contentType(MediaType.APPLICATION_JSON).body("{\"message\":\"Servicio temporalmente no disponible.\"}".getBytes(java.nio.charset.StandardCharsets.UTF_8));}
 }
}
