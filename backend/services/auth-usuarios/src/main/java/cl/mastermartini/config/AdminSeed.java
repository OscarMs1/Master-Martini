package cl.mastermartini.config;

import cl.mastermartini.model.Usuario;
import cl.mastermartini.repository.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Crea una cuenta administradora inicial solamente si todavía no existe. */
@Component
public class AdminSeed implements CommandLineRunner {

  private final UsuarioRepository usuarios;
  private final PasswordEncoder passwordEncoder;
  private final String email;
  private final String password;

  public AdminSeed(
      UsuarioRepository usuarios,
      PasswordEncoder passwordEncoder,
      @Value("${ADMIN_EMAIL:admin@gmail.com}") String email,
      @Value("${ADMIN_PASSWORD:}") String password) {
    this.usuarios = usuarios;
    this.passwordEncoder = passwordEncoder;
    this.email = email.trim().toLowerCase(Locale.ROOT);
    this.password = password;
  }

  @Override
  public void run(String... args) {
    // No sobrescribir cuentas existentes ni cambiar su contraseña al reiniciar.
    if (usuarios.existsByEmail(email) || password.isBlank()) {
      return;
    }

    if (password.length() < 12
        || password.getBytes(StandardCharsets.UTF_8).length > 72
        || !password.matches("(?s).*[a-zA-Z].*")
        || !password.matches("(?s).*[0-9].*")) {
      throw new IllegalArgumentException(
          "ADMIN_PASSWORD debe tener entre 12 y 72 bytes e incluir letras y números.");
    }

    Usuario administrador = new Usuario();
    administrador.setNombre("Administrador");
    administrador.setEmail(email);
    administrador.setRol("ADMINISTRADOR");
    administrador.setPasswordHash(passwordEncoder.encode(password));

    // La entidad Usuario exige estas columnas NOT NULL para clientes.
    // El administrador no necesita datos personales ni dirección de entrega.
    // Las cadenas vacías evitan inventar RUT, teléfono o domicilio.
    administrador.setRun("");
    administrador.setTelefono("");
    administrador.setRegion("");
    administrador.setComuna("");
    administrador.setDireccion("");

    usuarios.save(administrador);
  }
}
