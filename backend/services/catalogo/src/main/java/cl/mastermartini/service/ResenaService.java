package cl.mastermartini.service;

import cl.mastermartini.model.*;
import cl.mastermartini.repository.ResenaRepository;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ResenaService {
  private final ResenaRepository repo;

  public ResenaService(ResenaRepository repo) {
    this.repo = repo;
  }

  /** Reseñas de un producto con promedio y cantidad. {@code mia} indica si la escribió quien consulta. */
  @Transactional(readOnly = true)
  public Map<String, Object> listar(long productoId, Long usuarioActual) {
    List<Map<String, Object>> opiniones = repo.findTop100ByProducto_IdOrderByFechaDesc(productoId).stream()
        .map(r -> {
          Map<String, Object> row = new LinkedHashMap<>();
          row.put("id", r.getId());
          row.put("autor", r.getAutor());
          row.put("puntuacion", r.getPuntuacion());
          row.put("comentario", r.getComentario());
          row.put("fecha", r.getFecha());
          row.put("mia", Objects.equals(r.getUsuarioId(), usuarioActual));
          return row;
        })
        .toList();
    Map<String, Object> out = new LinkedHashMap<>();
    out.put("productoId", productoId);
    out.put("promedio", repo.promedio(productoId));
    out.put("cantidad", repo.countByProducto_Id(productoId));
    out.put("opiniones", opiniones);
    return out;
  }

  /** Crea la reseña o, si el cliente ya opinó sobre el producto, la reemplaza. */
  @Transactional
  public Map<String, Object> guardar(long usuarioId, Producto producto, String autor, int puntuacion, String comentario) {
    String a = autor == null ? "" : autor.trim();
    // La opinión llega como HTML del editor (TipTap) o como texto plano (versiones anteriores).
    String c = comentario == null ? "" : comentario.trim();
    if (c.startsWith("<")) c = HtmlSeguro.limpiarResena(c);
    else c = HtmlSeguro.limpiarResena("<p>" + escapar(c).replace("\n", "<br>") + "</p>");
    int largo = HtmlSeguro.textoVisible(c).length();
    if (a.length() < 2 || puntuacion < 1 || puntuacion > 5)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Revisa tu nombre y la valoración.");
    if (largo < 10 || largo > 500)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tu opinión debe tener entre 10 y 500 caracteres.");
    if (c.length() > 2000)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tu opinión tiene demasiado formato. Simplifícala un poco.");
    Resena r = repo.findByUsuarioIdAndProducto_Id(usuarioId, producto.getId())
        .orElseGet(() -> new Resena(usuarioId, producto));
    r.actualizar(a.substring(0, Math.min(80, a.length())), puntuacion, c, Instant.now());
    repo.save(r);
    return Map.of("guardado", true, "productoId", producto.getId());
  }

  private static String escapar(String t) {
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
  }

  /** El autor puede borrar su reseña; un administrador puede borrar cualquiera. */
  @Transactional
  public void quitar(long id, long usuarioId, boolean administrador) {
    Resena r = repo.findById(id)
        .filter(x -> administrador || x.getUsuarioId().equals(usuarioId))
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reseña no encontrada o sin permiso."));
    repo.delete(r);
  }
}
