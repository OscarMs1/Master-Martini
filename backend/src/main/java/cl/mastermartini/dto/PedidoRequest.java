package cl.mastermartini.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record PedidoRequest(
    @NotBlank @Pattern(regexp = "[a-fA-F0-9-]{36}") String requestKey,
    @NotBlank @Size(min = 3, max = 120) String nombre,
    @NotBlank @Email @Size(max = 120) String email,
    @NotBlank @Size(max = 15) String run,
    @NotBlank @Pattern(regexp = "[+0-9 -]{8,16}") String telefono,
    @NotBlank @Size(max = 120) String region,
    @NotBlank @Size(max = 120) String comuna,
    @NotBlank @Size(min = 5, max = 200) String direccion,
    @NotBlank @Pattern(regexp = "domicilio|retiro") String entrega,
    @NotBlank @Pattern(regexp = "APROBADO|RECHAZADO") String pago,
    @NotEmpty @Size(max = 100) List<@NotNull @Valid Item> items) {
  public record Item(@NotNull @Positive Long id, @Min(1) @Max(1000000) int cantidad) {}
}
