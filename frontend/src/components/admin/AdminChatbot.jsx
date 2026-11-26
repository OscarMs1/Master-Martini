import { useEffect, useState } from "react";
import { api } from "../../services/api";

const diaCorto = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-CL", { day: "2-digit", month: "short" });
const fechaHora = (iso) =>
  new Date(iso).toLocaleString("es-CL", {
    timeZone: "America/Santiago",
    dateStyle: "short",
    timeStyle: "short",
  });

/** Pestaña "Chatbot": qué le pregunta la gente al asistente de ayuda. */
export default function AdminChatbot() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function cargar() {
    setLoading(true);
    setError("");
    try {
      setDatos(await api("/admin/asistente/consultas"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    cargar();
  }, []);

  if (loading) return <p className="state-box" role="status">Cargando consultas…</p>;
  if (error)
    return (
      <div className="state-box">
        <p className="alert alert-danger" role="alert">{error}</p>
        <button className="btn btn-outline-primary" onClick={cargar}>Reintentar</button>
      </div>
    );
  if (!datos || datos.total === 0)
    return (
      <p className="state-box">
        Todavía nadie ha usado el chatbot. Cuando lo hagan, aquí verás qué preguntan.
      </p>
    );

  const maximo = Math.max(1, ...datos.porDia.map((d) => d.total));

  return (
    <div className="admin-chatbot">
      <div className="admin-stats">
        <div>
          <strong>{datos.total}</strong>
          <span>Preguntas guardadas</span>
        </div>
        <div>
          <strong>{datos.hoy}</strong>
          <span>Hoy</span>
        </div>
        <div>
          <strong>{datos.masFrecuentes.length ? datos.masFrecuentes[0].veces : 0}</strong>
          <span>Veces la más repetida</span>
        </div>
      </div>
      <p className="small text-muted">
        Solo se guarda el texto de la pregunta y la fecha, sin IP ni usuario. Las preguntas se borran
        solas a los {datos.retencionDias} días.
      </p>

      <h2 className="h4 mt-4">Lo que más preguntan</h2>
      <div className="table-responsive">
        <table className="table">
          <caption>Preguntas más frecuentes (las repetidas se agrupan)</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Pregunta</th>
              <th scope="col">Veces</th>
            </tr>
          </thead>
          <tbody>
            {datos.masFrecuentes.map((f, i) => (
              <tr key={`${i}-${f.pregunta}`}>
                <td>{i + 1}</td>
                <td>{f.pregunta}</td>
                <td>{f.veces}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="h4 mt-4">Consultas por día</h2>
      <ol className="admin-bars" aria-label="Consultas por día, últimos 14 días">
        {datos.porDia.map((d) => (
          <li key={d.fecha}>
            <span className="admin-bars-dia">{diaCorto(d.fecha)}</span>
            <span className="admin-bars-barra" aria-hidden="true">
              <span style={{ width: `${(d.total / maximo) * 100}%` }} />
            </span>
            <span className="admin-bars-total">{d.total}</span>
          </li>
        ))}
      </ol>

      <h2 className="h4 mt-4">Últimas preguntas</h2>
      <div className="table-responsive">
        <table className="table">
          <caption>Las 50 consultas más recientes</caption>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Pregunta</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {datos.recientes.map((c, i) => (
              <tr key={`${i}-${c.fecha}`}>
                <td>{fechaHora(c.fecha)}</td>
                <td>{c.texto}</td>
                <td>{c.respondida ? "Respondida" : "No se pudo responder"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
