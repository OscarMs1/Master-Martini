package cl.mastermartini.dto;

import jakarta.validation.constraints.*;

public record InscripcionRequest(@NotNull @Positive Long claseId) {}
