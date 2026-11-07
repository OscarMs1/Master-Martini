import AdminNovedades from "../components/admin/AdminNovedades";
import { useEffect, useRef, useState } from "react";
import { useShop } from "../context/ShopContext";
import { productosApi } from "../services/productosApi";
import { api } from "../services/api";
import ConsultasAdmin from "../components/admin/ConsultasAdmin";
import FormularioProducto from "../components/admin/FormularioProducto";
import TablaProductos from "../components/admin/TablaProductos";
import Estado from "../components/Estado";
export default function Admin() {
  const { productos, recargar, error: catalogError } = useShop();
  const [tab, setTab] = useState("productos"),
    [datos, setDatos] = useState({
      usuarios: [],
      pedidos: [],
      inscripciones: [],
      contactos: [],
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [editing, setEditing] = useState(undefined),
    [deleting, setDeleting] = useState(null),
    [busy, setBusy] = useState(false),
    [buscar, setBuscar] = useState("");
  const dialog = useRef(null),
    formArea = useRef(null);
  async function cargar() {
    setLoading(true);
    setError("");
    try {
      const entries = await Promise.all(
        ["usuarios", "pedidos", "inscripciones", "contactos"].map(
          async (key) => [key, await api(`/admin/${key}`)],
        ),
      );
      setDatos(Object.fromEntries(entries));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    cargar();
  }, []);
  useEffect(() => {
    if (deleting) dialog.current?.showModal();
  }, [deleting]);
  async function guardar(payload) {
    setBusy(true);
    setError("");
    try {
      editing
        ? await productosApi.editar(editing.id, payload)
        : await productosApi.crear(payload);
      await recargar();
      setEditing(undefined);
      setMessage("Producto guardado en la base de datos.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function eliminar() {
    setBusy(true);
    setError("");
    try {
      await productosApi.eliminar(deleting.id);
      await recargar();
      setMessage(
        "Producto eliminado. Los pedidos anteriores conservan su detalle.",
      );
      dialog.current.close();
      setDeleting(null);
    } catch (e) {
      setError(e.message);
      dialog.current.close();
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  }
  function editar(p) {
    setEditing(p);
    requestAnimationFrame(() =>
      formArea.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }),
    );
  }
  return (
    <section className="container-xl section">
      <p className="eyebrow">ADMINISTRACIÓN</p>
      <div className="section-heading">
        <h1>
          Todo, en <em>orden.</em>
        </h1>
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            recargar();
            cargar();
          }}
        >
          Actualizar datos
        </button>
      </div>
      <div className="admin-stats">
        {[
          [productos.length, "Productos"],
          [datos.usuarios.length, "Usuarios"],
          [datos.pedidos.length, "Pedidos"],
          [datos.inscripciones.length, "Inscripciones"],
        ].map(([count, label]) => (
          <div key={label}>
            <strong>{count}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div
        className="admin-tabs"
        role="group"
        aria-label="Secciones administrativas"
      >
        {["productos", "novedades", "usuarios", "pedidos", "inscripciones", "contactos"].map(
          (t) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ),
        )}
      </div>
      {(error || catalogError) && (
        <p className="alert alert-danger" role="alert">
          {error || catalogError}
        </p>
      )}
      {message && (
        <p className="alert alert-success" role="status">
          {message}
        </p>
      )}
      {tab === "novedades" ? <AdminNovedades /> : tab === "productos" ? (
        <>
          <div className="d-flex justify-content-between gap-3 flex-wrap mb-4">
            <input
              className="form-control admin-search"
              aria-label="Buscar en administración"
              placeholder="Buscar producto…"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => editar(null)}>
              + Nuevo producto
            </button>
          </div>
          <div ref={formArea} className="admin-form-area">
            {editing !== undefined && (
              <FormularioProducto
                key={editing?.id || "nuevo"}
                producto={editing}
                guardar={guardar}
                cancelar={() => setEditing(undefined)}
                busy={busy}
              />
            )}
          </div>
          <TablaProductos
            productos={productos.filter((p) =>
              p.nombre.toLowerCase().includes(buscar.toLowerCase()),
            )}
            editar={editar}
            eliminar={setDeleting}
          />
        </>
      ) : (
        <Estado loading={loading} error={error} retry={cargar}>
          <ConsultasAdmin tab={tab} registros={datos[tab]} />
        </Estado>
      )}
      <dialog
        ref={dialog}
        onCancel={() => setDeleting(null)}
        className="confirm-dialog"
      >
        <h2>Eliminar producto</h2>
        <p>¿Quieres eliminar «{deleting?.nombre}» del catálogo?</p>
        <p>Los pedidos anteriores conservarán sus datos.</p>
        <div className="d-flex gap-3">
          <button className="btn btn-danger" disabled={busy} onClick={eliminar}>
            {busy ? "Eliminando…" : "Eliminar producto"}
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              dialog.current.close();
              setDeleting(null);
            }}
          >
            Cancelar
          </button>
        </div>
      </dialog>
    </section>
  );
}
