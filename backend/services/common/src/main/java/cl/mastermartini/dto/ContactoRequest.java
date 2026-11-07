package cl.mastermartini.dto;

import jakarta.validation.constraints.*;

public record ContactoRequest(
    @NotBlank @Size(min = 2, max = 120) String nombre,
    @NotBlank @Email @Size(max = 120) String email,
    @NotBlank @Size(max = 120) String asunto,
    @NotBlank @Size(min = 10, max = 2000) String mensaje) {}
