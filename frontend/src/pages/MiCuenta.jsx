import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { dinero } from "../utils/comercio";
import Estado from "../components/Estado";
export default function MiCuenta() {
  const { user, logout } = useAuth(),
    navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]),
    [inscripciones, setInscripciones] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  async function cargar() {
    setError("");
    setLoading(true);
    try {
      const [p, i] = await Promise.all([
        api("/pedidos/mis-pedidos"),
        api("/inscripciones/mis-inscripciones"),
      ]);
      setPedidos(p);
      setInscripciones(i);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    cargar();
  }, []);
  return (
    <section className="container-xl section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TU ESPACIO</p>
          <h1>
            Hola, <em>{user.nombre.split(" ")[0]}.</em>
          </h1>
        </div>
        <div className="d-flex gap-3 flex-wrap">
          {user.rol === "ADMINISTRADOR" && (
            <Link className="btn btn-primary" to="/admin">
              Administrar tienda
            </Link>
          )}
          <button
            className="btn btn-outline-primary"
            onClick={async () => {
              try {
                await logout();
                navigate("/");
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      <div className="row g-5">
        <div className="col-lg-4">
          <aside className="summary-panel">
            <h2>Tus datos</h2>
            <p>
              <strong>{user.nombre}</strong>
              <br />
              {user.email}
            </p>
            {user.rol !== "ADMINISTRADOR" && (
              <>
                <p>
                  RUN: {user.run}
                  <br />
                  {user.telefono}
                </p>
                <p>
                  {user.direccion}
                  <br />
                  {user.comuna}, {user.region}
                </p>
              </>
            )}
            <span className="pill">
              {user.rol === "ADMINISTRADOR" ? "Administrador" : "Cliente"}
            </span>
          </aside>
        </div>
        <div className="col-lg-8">
          <Estado loading={loading} error={error} retry={cargar}>
            <h2>Mis pedidos</h2>
            {!pedidos.length ? (
              <p>
                Aún no tienes pedidos.{" "}
                <Link to="/catalogo">Encuentra tu próximo ingrediente.</Link>
              </p>
            ) : (
              pedidos.map((p) => (
                <details className="account-order" key={p.id}>
                  <summary>
                    <span>
                      Pedido #{p.id} ·{" "}
                      {new Date(p.fecha).toLocaleDateString("es-CL")}
                    </span>
                    <span>
                      {dinero(p.total)} · {p.estado}
                    </span>
                  </summary>
                  <ul>
                    {p.lineas.map((l) => (
                      <li key={l.productoId}>
                        {l.cantidad} × {l.nombre} · {dinero(l.precioUnitario)}
                      </li>
                    ))}
                  </ul>
                  <p>
                    {p.entrega === "retiro" ? "Retiro" : "Despacho"} ·{" "}
                    {p.direccion}, {p.comuna}
                  </p>
                  <p className="small">Compra simulada, sin cobro real.</p>
                </details>
              ))
            )}
            <h2 className="mt-5">Mis clases</h2>
            {!inscripciones.length ? (
              <p>
                Todavía no te has inscrito.{" "}
                <Link to="/clases">Explora las próximas clases.</Link>
              </p>
            ) : (
              inscripciones.map((i) => (
                <div className="account-order" key={i.id}>
                  <h3>{i.titulo}</h3>
                  <p>
                    {new Date(i.fechaClase).toLocaleString("es-CL", {
                      timeZone: "America/Santiago",
                    })}{" "}
                    · {i.modalidad}
                  </p>
                  <span className="pill">Inscripción confirmada</span>
                </div>
              ))
            )}
          </Estado>
        </div>
      </div>
    </section>
  );
}
