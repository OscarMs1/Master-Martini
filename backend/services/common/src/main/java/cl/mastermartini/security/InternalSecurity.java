package cl.mastermartini.security;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import org.springframework.context.annotation.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
@Configuration @ConditionalOnProperty(name="app.domain",havingValue="true")
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class InternalSecurity {
 @Bean SecurityFilterChain internal(HttpSecurity h,@org.springframework.beans.factory.annotation.Value("${app.service-key}")String key)throws Exception{
  if(key.length()<32)throw new IllegalArgumentException("Clave interna insuficiente");
  h.csrf(c->c.disable()).sessionManagement(c->c.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
  h.addFilterBefore(new OncePerRequestFilter(){
   protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest r,jakarta.servlet.http.HttpServletResponse s,jakarta.servlet.FilterChain chain)throws java.io.IOException,jakarta.servlet.ServletException{
    if(r.getRequestURI().equals("/api/estado")){chain.doFilter(r,s);return;}
    String supplied=r.getHeader("X-Service-Key");
    if(supplied==null||!MessageDigest.isEqual(key.getBytes(StandardCharsets.UTF_8),supplied.getBytes(StandardCharsets.UTF_8))){s.setStatus(401);return;}
    String uid=r.getHeader("X-User-Id"),role=r.getHeader("X-User-Role");
    if(uid!=null&&!uid.matches("[1-9][0-9]*")){s.setStatus(400);return;}
    var authorities=uid==null?List.<SimpleGrantedAuthority>of():List.of(new SimpleGrantedAuthority("ROLE_"+("ADMINISTRADOR".equals(role)?"ADMINISTRADOR":"CLIENTE")));
    SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(uid==null?"guest":uid,null,authorities));
    chain.doFilter(r,s);
   }
  },AnonymousAuthenticationFilter.class);
  h.authorizeHttpRequests(a->a.requestMatchers("/api/estado").permitAll().requestMatchers("/api/admin/**").hasRole("ADMINISTRADOR")
   .requestMatchers(org.springframework.http.HttpMethod.POST,"/api/productos").hasRole("ADMINISTRADOR")
   .requestMatchers(org.springframework.http.HttpMethod.PUT,"/api/productos/*").hasRole("ADMINISTRADOR")
   .requestMatchers(org.springframework.http.HttpMethod.DELETE,"/api/productos/*").hasRole("ADMINISTRADOR")
   .requestMatchers("/api/inscripciones/**","/api/pedidos/mis-pedidos","/api/favoritos/**").hasAnyRole("CLIENTE","ADMINISTRADOR")
   .anyRequest().authenticated());
  h.exceptionHandling(e->e.accessDeniedHandler((r,s,x)->s.setStatus(403)));return h.build();
 }
}
