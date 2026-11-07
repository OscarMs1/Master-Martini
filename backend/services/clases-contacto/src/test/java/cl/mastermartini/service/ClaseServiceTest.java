package cl.mastermartini.service;

import cl.mastermartini.model.Clase;
import cl.mastermartini.model.Inscripcion;
import cl.mastermartini.repository.ClaseRepository;
import cl.mastermartini.repository.InscripcionRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ClaseServiceTest {
  private final ClaseRepository clases = mock(ClaseRepository.class);
  private final InscripcionRepository inscripciones = mock(InscripcionRepository.class);
  private final Remote remoto = mock(Remote.class);
  private final ClaseService service = new ClaseService(clases, inscripciones, remoto, "http://catalogo:8080");
  private final Clase clase = new Clase();

  @BeforeEach void preparar() {
    SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("42", "-"));
    ReflectionTestUtils.setField(clase, "id", 7L);
    clase.setTitulo("Clase de prueba");
    clase.setModalidad("Online");
    clase.setFecha(Instant.now().plus(7, ChronoUnit.DAYS));
    clase.setCapacidad(2);
    when(clases.bloquear(7L)).thenReturn(Optional.of(clase));
  }
  @AfterEach void limpiar() { SecurityContextHolder.clearContext(); }

  @Test void noPermiteInscribirEnClaseInexistente() {
    when(clases.bloquear(7L)).thenReturn(Optional.empty());
    var error = assertThrows(ResponseStatusException.class, () -> service.inscribir(7L, "cliente@demo.local"));
    assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
    verify(inscripciones, never()).saveAndFlush(any());
  }

  @Test void noPermiteInscribirEnClaseRetirada() {
    clase.setRetirado(true);
    var error = assertThrows(ResponseStatusException.class, () -> service.inscribir(7L, "cliente@demo.local"));
    assertEquals(HttpStatus.NOT_FOUND, error.getStatusCode());
  }

  @Test void noDuplicaLaInscripcionDelMismoUsuario() {
    when(inscripciones.existsByUsuarioIdAndClaseId(42L, 7L)).thenReturn(true);
    var error = assertThrows(ResponseStatusException.class, () -> service.inscribir(7L, "cliente@demo.local"));
    assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
    verify(inscripciones, never()).saveAndFlush(any());
  }

  @Test void rechazaClaseVencida() {
    clase.setFecha(Instant.now().minus(1, ChronoUnit.DAYS));
    var error = assertThrows(ResponseStatusException.class, () -> service.inscribir(7L, "cliente@demo.local"));
    assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
    verify(inscripciones, never()).saveAndFlush(any());
  }

  @Test void rechazaCuposAgotados() {
    when(inscripciones.countByClaseId(7L)).thenReturn(2L);
    var error = assertThrows(ResponseStatusException.class, () -> service.inscribir(7L, "cliente@demo.local"));
    assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
    verify(inscripciones, never()).saveAndFlush(any());
  }

  @Test void guardaInscripcionDelUsuarioAutenticado() {
    when(inscripciones.saveAndFlush(any(Inscripcion.class))).thenAnswer(invocation -> {
      Inscripcion i = invocation.getArgument(0);
      ReflectionTestUtils.setField(i, "id", 100L);
      return i;
    });
    when(clases.findById(7L)).thenReturn(Optional.of(clase));
    var resultado = service.inscribir(7L, "email-no-confiable@demo.local");
    assertEquals(100L, resultado.get("id"));
    assertEquals(42L, resultado.get("usuarioId"));
    assertEquals(7L, resultado.get("claseId"));
    verify(inscripciones).saveAndFlush(argThat(i -> i.getUsuarioId().equals(42L) && i.getClaseId().equals(7L)));
  }
}
