package cl.mastermartini.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class Reglas {
  private Reglas() {}

  public static void validarRun(String value) {
    String run = value.replaceAll("[. -]", "").toUpperCase(java.util.Locale.ROOT);
    if (!run.matches("[0-9]{7,8}[0-9K]")) throw badRun();
    int sum = 0, factor = 2;
    for (int i = run.length() - 2; i >= 0; i--) {
      sum += (run.charAt(i) - '0') * factor;
      factor = factor == 7 ? 2 : factor + 1;
    }
    int dv = 11 - sum % 11;
    String esperado = dv == 11 ? "0" : dv == 10 ? "K" : String.valueOf(dv);
    if (!run.endsWith(esperado)) throw badRun();
  }

  private static ResponseStatusException badRun() {
    return new ResponseStatusException(
        HttpStatus.BAD_REQUEST, "RUN inválido: revisa el dígito verificador.");
  }
}
