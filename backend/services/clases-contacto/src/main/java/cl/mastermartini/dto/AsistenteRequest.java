package cl.mastermartini.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

/** Conversación que envía el widget de ayuda: solo los últimos turnos, cada uno acotado. */
public record AsistenteRequest(@NotEmpty @Size(max = 12) List<@Valid @NotNull Mensaje> mensajes) {
  public record Mensaje(
      @NotBlank @Pattern(regexp = "user|assistant") String rol,
      @NotBlank @Size(max = 1200) String texto) {}
}
