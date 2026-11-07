package cl.mastermartini.service;

import cl.mastermartini.dto.CambioPasswordRequest;
import cl.mastermartini.model.Usuario;
import cl.mastermartini.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioPasswordTest {
  @Test void exigeClaveActualYGuardaSoloHash() {
    var repo = mock(UsuarioRepository.class);
    var encoder = new BCryptPasswordEncoder(4);
    var usuario = new Usuario();
    usuario.setPasswordHash(encoder.encode("Anterior1234"));
    when(repo.findByEmail("cliente@example.com")).thenReturn(Optional.of(usuario));
    var service = new UsuarioService(repo, encoder);
    assertThrows(ResponseStatusException.class, () -> service.cambiarPassword("cliente@example.com", new CambioPasswordRequest("incorrecta", "NuevaClave1234")));
    verify(repo, never()).save(any());
    service.cambiarPassword("cliente@example.com", new CambioPasswordRequest("Anterior1234", "NuevaClave1234"));
    assertTrue(encoder.matches("NuevaClave1234", usuario.getPasswordHash()));
    assertFalse(encoder.matches("Anterior1234", usuario.getPasswordHash()));
    assertNotEquals("NuevaClave1234", usuario.getPasswordHash());
    verify(repo).save(usuario);
  }
  @Test void rechazaClaveRepetidaYExcesoDeBytes() {
    var repo = mock(UsuarioRepository.class);
    var encoder = new BCryptPasswordEncoder(4);
    var usuario = new Usuario();
    usuario.setPasswordHash(encoder.encode("Anterior1234"));
    when(repo.findByEmail("cliente@example.com")).thenReturn(Optional.of(usuario));
    var service = new UsuarioService(repo, encoder);
    assertThrows(ResponseStatusException.class, () -> service.cambiarPassword("cliente@example.com", new CambioPasswordRequest("Anterior1234", "Anterior1234")));
    assertThrows(ResponseStatusException.class, () -> service.cambiarPassword("cliente@example.com", new CambioPasswordRequest("Anterior1234", "á".repeat(40) + "123")));
    verify(repo, never()).save(any());
  }
}
