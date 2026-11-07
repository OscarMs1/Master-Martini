package cl.mastermartini.service;

import cl.mastermartini.dto.ContactoRequest;
import cl.mastermartini.model.Contacto;
import cl.mastermartini.repository.ContactoRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ContactoServiceTest {
  private final ContactoRepository repositorio = mock(ContactoRepository.class);
  private final ContactoService service = new ContactoService(repositorio);

  @Test void persisteDatosDeContactoYDevuelveElIdReal() {
    var solicitud = new ContactoRequest("Persona Prueba", "consulta@demo.local", "Consulta", "Mensaje de prueba del formulario.");
    when(repositorio.saveAndFlush(any(Contacto.class))).thenAnswer(invocation -> {
      Contacto contacto = invocation.getArgument(0);
      ReflectionTestUtils.setField(contacto, "id", 123L);
      return contacto;
    });
    assertEquals(123L, service.guardar(solicitud));
    verify(repositorio).saveAndFlush(argThat(c -> c.getNombre().equals("Persona Prueba")
        && c.getEmail().equals("consulta@demo.local") && c.getAsunto().equals("Consulta")
        && c.getMensaje().equals("Mensaje de prueba del formulario.") && c.getFecha() != null));
  }

  @Test void consultaContactosExistentes() {
    var guardados = List.of(new Contacto());
    when(repositorio.findAll()).thenReturn(guardados);
    assertSame(guardados, service.listar());
  }
}
