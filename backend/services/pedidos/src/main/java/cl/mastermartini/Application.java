package cl.mastermartini;
@org.springframework.boot.autoconfigure.SpringBootApplication(exclude=org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class)
@org.springframework.scheduling.annotation.EnableScheduling
public class Application { public static void main(String[] args){ org.springframework.boot.SpringApplication.run(Application.class,args); }}