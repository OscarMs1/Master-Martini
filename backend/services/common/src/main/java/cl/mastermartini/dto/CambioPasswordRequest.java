package cl.mastermartini.dto;

import jakarta.validation.constraints.*;

public record CambioPasswordRequest(
    @NotBlank @Size(max = 72) String actual,
    @NotBlank @Size(min = 10, max = 72)
    @Pattern(regexp = "(?s)(?=.*[A-Za-z])(?=.*[0-9]).+") String nueva) {}
