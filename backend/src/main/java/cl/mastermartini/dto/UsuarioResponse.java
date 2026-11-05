package cl.mastermartini.dto;

import cl.mastermartini.model.Usuario;

public record UsuarioResponse(
    Long id,
    String nombre,
    String email,
    String rol,
    String run,
    String telefono,
    String region,
    String comuna,
    String direccion) {
  public static UsuarioResponse from(Usuario u) {
    return new UsuarioResponse(
        u.getId(),
        u.getNombre(),
        u.getEmail(),
        u.getRol(),
        u.getRun(),
        u.getTelefono(),
        u.getRegion(),
        u.getComuna(),
        u.getDireccion());
  }
}
