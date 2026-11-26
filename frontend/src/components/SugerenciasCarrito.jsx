import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Plus } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { dinero, precioFinal } from "../utils/comercio";
import { fallbackImagenProducto } from "../utils/fallbackImagenProducto";
import { sugerirClases, sugerirProductos } from "../utils/recomendaciones";

/**
 * Sugerencias del carrito: productos que combinan con lo que el cliente lleva y clases del
 * taller donde se usan esos ingredientes. Si algo falla al cargar las clases, igual se
 * sugieren productos por línea.
 */
export default function SugerenciasCarrito() {
  const { items, productos, agregar } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clases, setClases] = useState([]);
  const [inscritas, setInscritas] = useState([]);
  const [ocupado, setOcupado] = useState(null);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    let activo = true;
    Promise.all([
      api("/clases").catch(() => []),
      user ? api("/inscripciones/mis-inscripciones").catch(() => []) : Promise.resolve([]),
    ]).then(([c, i]) => {
      if (!activo) return;
      setClases(Array.isArray(c) ? c : []);
      setInscritas(Array.isArray(i) ? i.map((x) => x.claseId) : []);
    });
    return () => { activo = false; };
  }, [user]);

  const productosSugeridos = useMemo(() => sugerirProductos(items, productos, clases), [items, productos, clases]);
  const clasesSugeridas = useMemo(
    () => sugerirClases(items, productos, clases, inscritas),
    [items, productos, clases, inscritas],
  );

  async function inscribir(clase) {
    if (!user) {
      navigate("/login", { state: { from: "/carrito" } });
      return;
    }
    setOcupado(clase.id);
    setAviso(null);
    try {
      await api("/inscripciones", { method: "POST", body: { claseId: clase.id } });
      setInscritas((prev) => [...prev, clase.id]);
      setAviso({ error: false, texto: `Te inscribiste en "${clase.titulo}". Puedes verla en Mi cuenta.` });
    } catch (e) {
      setAviso({ error: true, texto: e.message });
    } finally {
      setOcupado(null);
    }
  }

  if (!productosSugeridos.length && !clasesSugeridas.length) return null;

  return (
    <div className="cart-suggestions">
      {productosSugeridos.length > 0 && (
        <section aria-labelledby="sugerencias-productos">
          <p className="eyebrow">{items.length ? "COMPLETA TU PEDIDO" : "PARA EMPEZAR"}</p>
          <h2 id="sugerencias-productos">
            {items.length ? "Combina bien con tu selección" : "Destacados y ofertas"}
          </h2>
          <ul className="suggestion-grid">
            {productosSugeridos.map(({ producto: p, motivo }) => (
              <li className="suggestion-card" key={p.id}>
                <Link to={`/producto/${p.id}`} className="suggestion-image">
                  <img src={p.imagen} alt="" loading="lazy" onError={fallbackImagenProducto} />
                </Link>
                <span className="suggestion-reason">{motivo}</span>
                <h3><Link to={`/producto/${p.id}`}>{p.nombre}</Link></h3>
                <p className="suggestion-price">
                  <strong>{dinero(precioFinal(p))}</strong>
                  {p.descuento > 0 && <s>{dinero(p.precio)}</s>}
                </p>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  aria-label={`Agregar ${p.nombre} al carrito`}
                  onClick={() => { try { agregar(p, 1); } catch { /* el aviso ya se mostró */ } }}
                >
                  <Plus size={16} /> Agregar
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {clasesSugeridas.length > 0 && (
        <section aria-labelledby="sugerencias-clases" className="mt-5">
          <p className="eyebrow">APRENDE A USARLOS</p>
          <h2 id="sugerencias-clases">Clases para lo que llevas</h2>
          {aviso && (
            <p className={aviso.error ? "text-danger" : "text-success"} role="status">{aviso.texto}</p>
          )}
          <ul className="suggestion-classes">
            {clasesSugeridas.map(({ clase: c, motivo }) => (
              <li key={c.id} className="suggestion-class">
                {c.imagen && <img src={c.imagen} alt="" loading="lazy" />}
                <div>
                  <span className="suggestion-reason">{motivo}</span>
                  <h3>{c.titulo}</h3>
                  <p className="small mb-2">
                    <CalendarDays size={14} />{" "}
                    {new Date(c.fecha).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Santiago" })}
                    {" · "}{c.modalidad} · {c.cuposDisponibles} cupos · Sin costo
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={ocupado !== null || inscritas.includes(c.id)}
                    onClick={() => inscribir(c)}
                  >
                    {inscritas.includes(c.id) ? "Inscrito ✓" : ocupado === c.id ? "Reservando…" : "Inscribirme"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
