package cl.mastermartini.config;

import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<?> business(ResponseStatusException e) {
    return ResponseEntity.status(e.getStatusCode())
        .body(Map.of("message", Objects.requireNonNullElse(e.getReason(), "Solicitud inválida.")));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<?> validation(MethodArgumentNotValidException e) {
    Map<String, String> fields = new LinkedHashMap<>();
    e.getBindingResult()
        .getFieldErrors()
        .forEach(f -> fields.put(f.getField(), "Revisa este campo: " + f.getDefaultMessage()));
    return ResponseEntity.badRequest()
        .body(Map.of("message", "Revisa los campos del formulario.", "fields", fields));
  }

  @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
  public ResponseEntity<?> uploadTooLarge() {
    return ResponseEntity.status(413).body(Map.of("message", "La imagen supera el máximo de 5 MB."));
  }

  @ExceptionHandler(AuthenticationException.class)
  public ResponseEntity<?> authentication() {
    return ResponseEntity.status(401).body(Map.of("message", "Correo o contraseña incorrectos."));
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<?> denied() {
    return ResponseEntity.status(403)
        .body(Map.of("message", "No tienes permiso para esta operación."));
  }

  @ExceptionHandler({
    DataIntegrityViolationException.class,
    PessimisticLockingFailureException.class
  })
  public ResponseEntity<?> conflict() {
    return ResponseEntity.status(409)
        .body(
            Map.of(
                "message",
                "El registro ya existe o cambió durante la operación. Actualiza y vuelve a"
                    + " intentar."));
  }

  @ExceptionHandler({
    org.springframework.http.converter.HttpMessageNotReadableException.class,
    org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class
  })
  public ResponseEntity<?> malformed() {
    return ResponseEntity.badRequest()
        .body(
            Map.of(
                "message",
                "JSON o parámetros inválidos. No incluyas campos ajenos al formulario."));
  }
}
