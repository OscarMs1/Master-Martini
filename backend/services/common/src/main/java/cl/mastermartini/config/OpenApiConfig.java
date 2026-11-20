package cl.mastermartini.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;

/** Documentación OpenAPI común: todas las rutas se llaman a través del gateway ("/"). */
@Configuration
public class OpenApiConfig {
  @Bean
  OpenAPI openApi(@Value("${spring.application.name:master-martini}") String nombre) {
    return new OpenAPI()
        .info(new Info().title("Master Martini · " + nombre).version("3.0.0")
            .description("Autenticación JWT: inicia sesión con POST /api/auth/token (o /login en la web) y envía"
                + " la cabecera Authorization: Bearer <token>. Renueva con POST /api/auth/refresh."))
        // Sin esto los servicios internos anunciarían su host de Docker (http://catalogo:8080).
        .servers(List.of(new Server().url("/")))
        .components(new Components().addSecuritySchemes("bearer",
            new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
        .addSecurityItem(new SecurityRequirement().addList("bearer"));
  }
}
