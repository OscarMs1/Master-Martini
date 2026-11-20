package cl.mastermartini.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Respuesta de login y renovación. El cliente envía {@code Authorization: Bearer <accessToken>}.
 * {@code refreshToken} solo viene para la app móvil; la web lo recibe en una cookie HttpOnly.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record TokenResponse(
    String accessToken, String tokenType, long expiresIn, String refreshToken, UsuarioResponse usuario) {}
