package cl.mastermartini.service;

import cl.mastermartini.model.ConsultaAsistente;
import cl.mastermartini.repository.ConsultaAsistenteRepository;
import java.text.Normalizer;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/**
 * Registro de las preguntas que la gente le hace al asistente, para que el administrador vea qué se
 * consulta más. Guarda solo el texto de la pregunta y la fecha, y borra lo que tenga más de 90 días.
 */
@Service
public class ConsultaAsistenteService {
  private static final Logger log = LoggerFactory.getLogger(ConsultaAsistenteService.class);

  static final int MAX_CARACTERES = 300;
  static final Duration RETENCION = Duration.ofDays(90);
  private static final Duration ENTRE_LIMPIEZAS = Duration.ofHours(1);
  private static final int DIAS_GRAFICO = 14;
  private static final int TOP = 20;
  private static final ZoneId CHILE = ZoneId.of("America/Santiago");

  private final ConsultaAsistenteRepository repo;
  private volatile Instant ultimaLimpieza = Instant.EPOCH;

  public ConsultaAsistenteService(ConsultaAsistenteRepository repo) {
    this.repo = repo;
  }

  /** Minúsculas, sin tildes ni signos y con espacios simples: "¿Qué ofertas hay?" -> "que ofertas hay". */
  static String normalizar(String texto) {
    if (texto == null) return "";
    String sinTildes = Normalizer.normalize(texto, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
    String limpio =
        sinTildes.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", " ").trim();
    return recortar(limpio);
  }

  /** Quita saltos de línea y espacios repetidos, y corta a {@link #MAX_CARACTERES}. */
  static String compactar(String texto) {
    if (texto == null) return "";
    return recortar(texto.replaceAll("\\s+", " ").trim());
  }

  private static String recortar(String texto) {
    if (texto.length() <= MAX_CARACTERES) return texto;
    int fin = MAX_CARACTERES;
    // No partir un carácter que ocupa dos posiciones (por ejemplo un emoji).
    if (Character.isHighSurrogate(texto.charAt(fin - 1))) fin--;
    return texto.substring(0, fin).trim();
  }

  /** Nunca lanza excepciones: si falla el registro, el asistente debe seguir respondiendo. */
  public void registrar(String pregunta, boolean respondida) {
    try {
      String texto = compactar(pregunta);
      String clave = normalizar(pregunta);
      if (texto.isEmpty() || clave.isEmpty()) return;
      ConsultaAsistente c = new ConsultaAsistente();
      c.setTexto(texto);
      c.setClave(clave);
      c.setFecha(Instant.now());
      c.setRespondida(respondida);
      repo.save(c);
      limpiarSiCorresponde();
    } catch (Exception e) {
      log.warn("No se pudo registrar la consulta del asistente: {}", e.getMessage());
    }
  }

  private void limpiarSiCorresponde() {
    Instant ahora = Instant.now();
    if (ahora.isBefore(ultimaLimpieza.plus(ENTRE_LIMPIEZAS))) return;
    ultimaLimpieza = ahora;
    int borradas = repo.borrarAnteriores(ahora.minus(RETENCION));
    if (borradas > 0) log.info("Consultas del asistente borradas por antigüedad: {}", borradas);
  }

  /** Datos para la pestaña "Chatbot" del administrador. */
  public Map<String, Object> resumen() {
    LocalDate hoy = LocalDate.now(CHILE);
    Instant inicioHoy = hoy.atStartOfDay(CHILE).toInstant();
    LocalDate primerDia = hoy.minusDays(DIAS_GRAFICO - 1L);

    Map<LocalDate, Long> porDia = new TreeMap<>();
    for (int i = 0; i < DIAS_GRAFICO; i++) porDia.put(primerDia.plusDays(i), 0L);
    for (Instant f : repo.fechasDesde(primerDia.atStartOfDay(CHILE).toInstant())) {
      porDia.merge(f.atZone(CHILE).toLocalDate(), 1L, Long::sum);
    }

    List<Map<String, Object>> dias = new ArrayList<>();
    porDia.forEach((dia, total) -> dias.add(fila("fecha", dia.toString(), "total", total)));

    List<Map<String, Object>> frecuentes = new ArrayList<>();
    for (ConsultaAsistenteRepository.Frecuente f : repo.masFrecuentes(PageRequest.of(0, TOP))) {
      frecuentes.add(fila("pregunta", f.getEjemplo(), "veces", f.getVeces()));
    }

    List<Map<String, Object>> recientes = new ArrayList<>();
    for (ConsultaAsistente c : repo.findTop50ByOrderByFechaDesc()) {
      recientes.add(
          fila("texto", c.getTexto(), "fecha", c.getFecha(), "respondida", c.isRespondida()));
    }

    Map<String, Object> r = new LinkedHashMap<>();
    r.put("total", repo.count());
    r.put("hoy", repo.countByFechaGreaterThanEqual(inicioHoy));
    r.put("retencionDias", RETENCION.toDays());
    r.put("porDia", dias);
    r.put("masFrecuentes", frecuentes);
    r.put("recientes", recientes);
    return r;
  }

  private static Map<String, Object> fila(Object... paresClaveValor) {
    Map<String, Object> m = new LinkedHashMap<>();
    for (int i = 0; i < paresClaveValor.length; i += 2) {
      m.put((String) paresClaveValor[i], paresClaveValor[i + 1]);
    }
    return m;
  }
}
