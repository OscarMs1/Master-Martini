package cl.mastermartini.service;
import org.springframework.web.client.*;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.server.ResponseStatusException;
@Component public class Remote {
 private final String key; private final RestClient client;
 public Remote(@Value("${app.service-key}")String key){this.key=key;var f=new org.springframework.http.client.SimpleClientHttpRequestFactory();f.setConnectTimeout(2000);f.setReadTimeout(10000);client=RestClient.builder().requestFactory(f).build();}
 public <T>T call(String url,HttpMethod method,Object body,Class<T> type){
  try {var req=client.method(method).uri(url).header("X-Service-Key",key);if(body!=null)req.body(body);return req.retrieve().body(type);}
  catch(HttpStatusCodeException e){String message="Operación rechazada por el servicio.";try{message=new com.fasterxml.jackson.databind.ObjectMapper().readTree(e.getResponseBodyAsString()).path("message").asText(message);}catch(Exception ignored){}throw new ResponseStatusException(e.getStatusCode(),message);}
  catch(RestClientException e){throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Servicio no disponible. La operación pendiente se recuperará de forma segura.");}
 }
}
