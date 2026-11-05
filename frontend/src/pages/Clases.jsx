import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Estado from "../components/Estado";
export default function Clases() {
  const [clases, setClases] = useState([]),
    [inscritas, setInscritas] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(null),
    [modalidad, setModalidad] = useState("");
  const { user } = useAuth(),
    navigate = useNavigate();
  async function cargar() {
    setLoading(true);
    setError("");
    try {
      const [c, i] = await Promise.all([
        api("/clases"),
        user ? api("/inscripciones/mis-inscripciones") : Promise.resolve([]),
      ]);
      setClases(c);
      setInscritas(i.map((i) => i.claseId));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    cargar();
  }, [user]);
  async function inscribir(id) {
    if (!user) {
      navigate("/login", { state: { from: "/clases" } });
      return;
    }
    setBusy(id);
    setMessage("");
    try {
      await api("/inscripciones", { method: "POST", body: { claseId: id } });
      setMessage(
        "Tu inscripción quedó guardada. Puedes consultarla en Mi cuenta.",
      );
      await cargar();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <section className="page-heading classes-heading">
        <div className="container-xl">
          <p className="eyebrow">APRENDE CON LAS MANOS</p>
          <h1>
            Más técnica.
            <br />
            <em>Más posibilidades.</em>
          </h1>
          <p>
            Un espacio para aprender, compartir y darle tu sello a cada receta.
          </p>
          <p className="class-cost">Actividades sin costo</p>
        </div>
      </section>
      <section className="container-xl section classes-list">
        <div className="d-flex justify-content-between flex-wrap gap-3 mb-4">
          <p>Reserva tu lugar con tu cuenta de cliente.</p>
          <select
            className="form-select w-auto"
            aria-label="Filtrar modalidad"
            value={modalidad}
            onChange={(e) => setModalidad(e.target.value)}
          >
            <option value="">Todas las modalidades</option>
            <option>Presencial</option>
            <option>Online</option>
          </select>
        </div>
        {message && (
          <div role="status" className="alert alert-info">
            {message}
          </div>
        )}
        <Estado loading={loading} error={error} retry={cargar}>
          <div className="row g-4">
            {clases
              .filter((c) => !modalidad || c.modalidad === modalidad)
              .map((c) => (
                <div className="col-md-6" key={c.id}>
                  <article className="class-card">
                    <img src={c.imagen} alt={c.titulo} />
                    <div className="p-4">
                      <p className="eyebrow">
                        {c.modalidad} · {c.nivel}
                      </p>
                      <h2>{c.titulo}</h2>
                      <p>{c.descripcion}</p>
                      <div className="class-meta">
                        <span>
                          <CalendarDays size={16} />
                          {new Date(c.fecha).toLocaleString("es-CL", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "America/Santiago",
                          })}
                        </span>
                        <span>
                          <Clock3 size={16} />
                          {c.duracion}
                        </span>
                        <span>
                          <Users size={16} />
                          {c.cuposDisponibles} cupos
                        </span>
                      </div>
                      <p className="small">{c.lugar} · Horario de Chile</p>
                      <div className="class-supplies">
                        <strong>Insumos relacionados</strong>
                        {c.productos.map((p) => (
                          <Link to={`/producto/${p.id}`} key={p.id}>
                            {p.nombre} ↗
                          </Link>
                        ))}
                      </div>
                      <button
                        className="btn btn-primary mt-3"
                        disabled={
                          inscritas.includes(c.id) ||
                          !c.cuposDisponibles ||
                          busy === c.id
                        }
                        onClick={() => inscribir(c.id)}
                      >
                        {inscritas.includes(c.id)
                          ? "Ya estás inscrito ✓"
                          : busy === c.id
                            ? "Reservando…"
                            : !c.cuposDisponibles
                              ? "Sin cupos"
                              : "Inscribirme →"}
                      </button>
                    </div>
                  </article>
                </div>
              ))}
          </div>
        </Estado>
      </section>
    </>
  );
}
