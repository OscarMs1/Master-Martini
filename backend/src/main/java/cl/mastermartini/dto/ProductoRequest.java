package cl.mastermartini.dto;

import jakarta.validation.constraints.*;

public record ProductoRequest(
    @NotBlank @Size(max = 120) String nombre,
    @NotBlank @Pattern(regexp = "panaderia|gelateria|food-service|retail") String categoria,
    @NotBlank @Size(max = 80) String formato,
    @NotBlank @Size(max = 1500) String descripcion,
    @Min(1) @Max(100000000) long precio,
    @Min(0) @Max(90) int descuento,
    @Min(0) @Max(1000000) int stock,
    @NotBlank
        @Pattern(
            regexp =
                "(/api/imagenes/[a-f0-9-]{36}\\.png|/assets/images/[a-z0-9-]+\\.(jpg|jpeg|webp)|https://mastermartini\\.cl/wp-content/uploads/2023/06/Margarinas-1\\.jpg)")
        String imagen,
    boolean destacado) {}
