package cl.mastermartini.security;
import org.springframework.security.core.context.SecurityContextHolder;
public final class Actor {
 private Actor(){}
 public static Long id(){var a=SecurityContextHolder.getContext().getAuthentication();return a==null||a.getName().equals("anonymousUser")||a.getName().equals("guest")?null:Long.valueOf(a.getName());}
 public static boolean admin(){var a=SecurityContextHolder.getContext().getAuthentication();return a!=null&&a.getAuthorities().stream().anyMatch(x->x.getAuthority().equals("ROLE_ADMINISTRADOR"));}
}
