package cl.mastermartini.dto;

import jakarta.validation.constraints.*;

public record LoginRequest(
    @NotBlank @Email @Size(max = 120) String email, @NotBlank @Size(max = 72) String password) {}
