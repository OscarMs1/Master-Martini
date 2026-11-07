package cl.mastermartini.dto;
import jakarta.validation.constraints.*;
public record NovedadRequest(
 @NotBlank @Size(max=160) String titulo,
 @NotBlank @Pattern(regexp="[a-z0-9]+(?:-[a-z0-9]+)*") @Size(max=160) String slug,
 @NotBlank @Size(max=500) String bajada,
 @NotBlank @Size(max=15000) String contenido,
 @NotBlank @Pattern(regexp="(/api/imagenes/[a-f0-9-]{36}\\.png|/assets/images/[a-z0-9-]+\\.jpg)") String imagen,
 @NotNull java.time.LocalDate fecha, boolean publicado) {}
