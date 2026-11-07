package cl.mastermartini.dto;

import jakarta.validation.constraints.*;

public record RegistroRequest(
    @NotBlank @Size(min = 3, max = 120) String nombre,
    @NotBlank @Email @Size(max = 120) String email,
    @NotBlank @Size(min = 10, max = 72) @Pattern(regexp = "(?s)(?=.*[A-Za-z])(?=.*[0-9]).+")
        String password,
    @NotBlank @Size(max = 15) String run,
    @NotBlank @Pattern(regexp = "[+0-9 -]{8,16}") String telefono,
    @NotBlank @Size(max = 120) String region,
    @NotBlank @Size(max = 120) String comuna,
    @NotBlank @Size(min = 5, max = 200) String direccion) {}
