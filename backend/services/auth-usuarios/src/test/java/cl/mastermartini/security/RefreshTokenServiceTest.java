package cl.mastermartini.security;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import cl.mastermartini.model.RefreshToken;
import cl.mastermartini.repository.RefreshTokenRepository;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.*;

class RefreshTokenServiceTest {
  final Map<String, RefreshToken> tabla = new HashMap<>();
  final RefreshTokenRepository repo = mock(RefreshTokenRepository.class);
  Instant ahora = Instant.parse("2026-11-20T12:00:00Z");
  RefreshTokenService service;

  @BeforeEach
  void preparar() {
    when(repo.save(any())).thenAnswer(i -> { RefreshToken t = i.getArgument(0); tabla.put(t.getHash(), t); return t; });
    when(repo.findByHash(anyString())).thenAnswer(i -> Optional.ofNullable(tabla.get((String) i.getArgument(0))));
    when(repo.revocarFamilia(anyString())).thenAnswer(i -> {
      tabla.values().stream().filter(t -> t.getFamilia().equals(i.getArgument(0))).forEach(t -> t.setRevocado(true));
      return 1;
    });
    when(repo.revocarEmail(anyString())).thenAnswer(i -> {
      tabla.values().stream().filter(t -> t.getEmail().equals(i.getArgument(0))).forEach(t -> t.setRevocado(true));
      return 1;
    });
    Clock reloj = new Clock() {
      public ZoneId getZone() { return ZoneOffset.UTC; }
      public Clock withZone(ZoneId z) { return this; }
      public Instant instant() { return ahora; }
    };
    service = new RefreshTokenService(repo, 7, reloj);
  }

  @Test void soloSeGuardaElHash() {
    String valor = service.emitir("a@test.cl");
    assertFalse(tabla.containsKey(valor));
    assertTrue(tabla.containsKey(RefreshTokenService.hash(valor)));
  }

  @Test void rotarEntregaUnTokenNuevo() {
    String v1 = service.emitir("a@test.cl");
    var r = service.rotar(v1).orElseThrow();
    assertEquals("a@test.cl", r.email());
    assertNotEquals(v1, r.valor());
    assertTrue(service.rotar(r.valor()).isPresent());
  }

  @Test void reusarUnTokenGastadoRevocaTodaLaFamilia() {
    String v1 = service.emitir("a@test.cl");
    String v2 = service.rotar(v1).orElseThrow().valor();
    ahora = ahora.plus(Duration.ofMinutes(5));
    assertTrue(service.rotar(v1).isEmpty(), "token robado reutilizado");
    assertTrue(service.rotar(v2).isEmpty(), "el token legítimo también queda revocado");
  }

  @Test void dosPestanasSimultaneasNoCierranLaSesion() {
    String v1 = service.emitir("a@test.cl");
    assertTrue(service.rotar(v1).isPresent());
    ahora = ahora.plusSeconds(5);
    assertTrue(service.rotar(v1).isPresent());
  }

  @Test void tokenVencidoNoSirve() {
    String v1 = service.emitir("a@test.cl");
    ahora = ahora.plus(Duration.ofDays(8));
    assertTrue(service.rotar(v1).isEmpty());
  }

  @Test void logoutYCambioDePasswordRevocan() {
    String v1 = service.emitir("a@test.cl");
    service.revocar(v1);
    assertTrue(service.rotar(v1).isEmpty());
    String v2 = service.emitir("b@test.cl");
    String v3 = service.emitir("b@test.cl");
    service.revocarUsuario("b@test.cl");
    assertTrue(service.rotar(v2).isEmpty());
    assertTrue(service.rotar(v3).isEmpty());
  }

  @Test void valoresInventadosNoLleganALaBase() {
    assertTrue(service.rotar(null).isEmpty());
    assertTrue(service.rotar("x' or '1'='1").isEmpty());
    verify(repo, never()).findByHash(anyString());
  }
}
