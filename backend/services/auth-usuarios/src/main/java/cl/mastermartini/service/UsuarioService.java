package cl.mastermartini.service;

import cl.mastermartini.dto.*;
import cl.mastermartini.model.Usuario;
import cl.mastermartini.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {
  private final UsuarioRepository repo;
  private final PasswordEncoder encoder;

  public UsuarioService(UsuarioRepository repo, PasswordEncoder encoder) {
    this.repo = repo;
    this.encoder = encoder;
  }

  public Usuario obtener(String email) {
    return repo.findByEmail(email)
        .orElseThrow(
            () ->
                new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Inicia sesión para continuar."));
  }

  @Transactional
  public void cambiarPassword(String email, CambioPasswordRequest datos) {
    Usuario usuario = obtener(email);
    if (!encoder.matches(datos.actual(), usuario.getPasswordHash()))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual no es correcta.");
    if (datos.nueva().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña supera 72 bytes UTF-8.");
    if (encoder.matches(datos.nueva(), usuario.getPasswordHash()))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Elige una contraseña diferente de la actual.");
    usuario.setPasswordHash(encoder.encode(datos.nueva()));
    repo.save(usuario);
  }

  @Transactional
  public UsuarioResponse registrar(RegistroRequest r) {
    Reglas.validarRun(r.run());
    String region = Ubicaciones.validar(r.region(), r.comuna());
    if (r.password().getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "La contraseña supera 72 bytes UTF-8.");
    String email = r.email().trim().toLowerCase(java.util.Locale.ROOT);
    if (repo.existsByEmail(email))
      throw new ResponseStatusException(
          HttpStatus.CONFLICT, "Ya existe una cuenta con este correo.");
    Usuario u = new Usuario();
    u.setNombre(r.nombre().trim());
    u.setEmail(email);
    u.setPasswordHash(encoder.encode(r.password()));
    // El rol nunca se recibe del navegador: el registro público solo crea CLIENTE.
    u.setRol("CLIENTE");
    u.setRun(r.run());
    u.setTelefono(r.telefono());
    u.setRegion(region);
    u.setComuna(r.comuna());
    u.setDireccion(r.direccion());
    return UsuarioResponse.from(repo.save(u));
  }
}
