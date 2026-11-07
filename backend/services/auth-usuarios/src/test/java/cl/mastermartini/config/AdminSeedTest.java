package cl.mastermartini.config;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import cl.mastermartini.model.Usuario;
import cl.mastermartini.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class AdminSeedTest {

  @Test
  void creaAdministradorConTodosLosCamposObligatorios() {
    UsuarioRepository repositorio = mock(UsuarioRepository.class);
    var encoder = new BCryptPasswordEncoder(4);
    var seed = new AdminSeed(repositorio, encoder, " ADMIN@EXAMPLE.COM ", "ClaveSegura2026");

    seed.run();

    ArgumentCaptor<Usuario> guardado = ArgumentCaptor.forClass(Usuario.class);
    verify(repositorio).save(guardado.capture());
    Usuario administrador = guardado.getValue();
    assertEquals("admin@example.com", administrador.getEmail());
    assertEquals("ADMINISTRADOR", administrador.getRol());
    assertEquals("Administrador", administrador.getNombre());
    assertTrue(encoder.matches("ClaveSegura2026", administrador.getPasswordHash()));
    assertNotEquals("ClaveSegura2026", administrador.getPasswordHash());
    assertNotNull(administrador.getRun());
    assertNotNull(administrador.getTelefono());
    assertNotNull(administrador.getRegion());
    assertNotNull(administrador.getComuna());
    assertNotNull(administrador.getDireccion());
  }

  @Test
  void noCambiaUnaCuentaExistente() {
    UsuarioRepository repositorio = mock(UsuarioRepository.class);
    when(repositorio.existsByEmail("admin@example.com")).thenReturn(true);
    var seed = new AdminSeed(repositorio, new BCryptPasswordEncoder(4),
        "admin@example.com", "ClaveSegura2026");

    seed.run();

    verify(repositorio, never()).save(any());
  }

  @Test
  void noCreaAdministradorSinClave() {
    UsuarioRepository repositorio = mock(UsuarioRepository.class);
    var seed = new AdminSeed(repositorio, new BCryptPasswordEncoder(4),
        "admin@example.com", "");

    seed.run();

    verify(repositorio, never()).save(any());
  }

  @Test
  void rechazaClaveInseguraSinGuardarUsuario() {
    UsuarioRepository repositorio = mock(UsuarioRepository.class);
    var seed = new AdminSeed(repositorio, new BCryptPasswordEncoder(4),
        "admin@example.com", "123456789012");

    IllegalArgumentException error = assertThrows(IllegalArgumentException.class, seed::run);
    assertTrue(error.getMessage().contains("ADMIN_PASSWORD"));
    verify(repositorio, never()).save(any());
  }
}
