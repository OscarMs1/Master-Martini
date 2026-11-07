package cl.mastermartini.service;

import cl.mastermartini.model.*;
import cl.mastermartini.repository.*;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClaseService {
  private final ClaseRepository clases;
  private final InscripcionRepository inscripciones;
  private final Remote remote;private final String catalog;
  public ClaseService(ClaseRepository clases,InscripcionRepository inscripciones,Remote remote,@org.springframework.beans.factory.annotation.Value("${app.catalog-url}")String catalog){this.clases=clases;this.inscripciones=inscripciones;this.remote=remote;this.catalog=catalog;}
  public List<Map<String, Object>> listar() {
    return clases.findAll(org.springframework.data.domain.Sort.by("fecha")).stream()
        .filter(c -> !c.isRetirado())
        .map(
            c -> {
              Map<String, Object> v = new LinkedHashMap<>();
              v.put("id", c.getId());
              v.put("titulo", c.getTitulo());
              v.put("descripcion", c.getDescripcion());
              v.put("fecha", c.getFecha());
              v.put("modalidad", c.getModalidad());
              v.put("nivel", c.getNivel());
              v.put("duracion", c.getDuracion());
              v.put("lugar", c.getLugar());
              v.put("imagen", c.getImagen());
              v.put("cuposDisponibles", c.getCapacidad() - inscripciones.countByClaseId(c.getId()));
              var ids = Arrays.stream(c.getProductosIds().split(",")).map(Long::valueOf).toList();
              var relacionados=new java.util.ArrayList<java.util.Map<String,Object>>();
              for(Long id:ids)try{var producto=remote.call(catalog+"/api/productos/"+id,org.springframework.http.HttpMethod.GET,null,java.util.Map.class);relacionados.add(java.util.Map.of("id",producto.get("id"),"nombre",producto.get("nombre")));}catch(org.springframework.web.server.ResponseStatusException ex){if(ex.getStatusCode().value()!=404)throw ex;}
              v.put("productos",relacionados);
              return v;
            })
        .toList();
  }

  @Transactional
  public Map<String, Object> inscribir(Long claseId, String email) {
    Long uid=cl.mastermartini.security.Actor.id();
    Clase c =
        clases
            .bloquear(claseId)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clase no encontrada."));
    if (c.isRetirado()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Clase no disponible.");
    if (inscripciones.existsByUsuarioIdAndClaseId(uid, claseId))
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya estás inscrito en esta clase.");
    if (!c.getFecha().isAfter(Instant.now()))
      throw new ResponseStatusException(HttpStatus.CONFLICT, "La fecha de inscripción ya pasó.");
    if (inscripciones.countByClaseId(claseId) >= c.getCapacidad())
      throw new ResponseStatusException(HttpStatus.CONFLICT, "No quedan cupos en esta clase.");
    Inscripcion i = new Inscripcion();
    i.setUsuarioId(uid);
    i.setClaseId(claseId);
    i.setFecha(Instant.now());
    return vista(inscripciones.saveAndFlush(i));
  }

  public List<Map<String, Object>> propias(String email) {
    return inscripciones.findByUsuarioIdOrderByFechaDesc(cl.mastermartini.security.Actor.id()).stream()
        .map(this::vista)
        .toList();
  }

  public List<Map<String, Object>> todas() {
    return inscripciones.findAll().stream().map(this::vista).toList();
  }

  private Map<String, Object> vista(Inscripcion i) {
    Clase c = clases.findById(i.getClaseId()).orElseThrow();
    return Map.of(
        "id",
        i.getId(),
        "claseId",
        c.getId(),
        "usuarioId",
        i.getUsuarioId(),
        "titulo",
        c.getTitulo(),
        "fechaClase",
        c.getFecha(),
        "modalidad",
        c.getModalidad());
  }
}
