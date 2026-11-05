import { fallbackImagenProducto } from "../../utils/fallbackImagenProducto";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { dinero, precioFinal } from "../../utils/comercio";
import { categoriaNombre } from "../../data/editorial";
export default function TarjetaProducto({ producto: p, onAgregar }) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const disponible = Number(p.stock) > 0;

  // Aviso temporal sobre la foto: no cambia la altura de las tarjetas.
  useEffect(() => {
    if (!error && !message) return undefined;
    const timer = window.setTimeout(() => {
      setError("");
      setMessage("");
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [error, message]);

  function agregar() {
    // El botón conserva la apariencia de agotado, pero permite consultar
    // por qué no se puede comprar (también con teclado).
    if (!disponible) {
      setMessage("");
      setError("Sin stock. Este producto no se puede agregar al carrito.");
      return;
    }
    try {
      onAgregar(p);
      setMessage(`${p.nombre} agregado al carrito.`);
      setError("");
    } catch (e) {
      setMessage("");
      setError(e instanceof Error ? e.message : "No se pudo agregar el producto.");
    }
  }
  return (
    <article className="product-card">
      <div className="product-media">
        <Link className="product-image" to={`/producto/${p.id}`}>
          <img
            src={p.imagen}
            onError={fallbackImagenProducto}
            alt={p.nombre}
            loading="lazy"
          />
          {p.descuento > 0 && (
            <span className="discount-tag">−{p.descuento}%</span>
          )}
        </Link>
        <div className="product-feedback" aria-live="polite" aria-atomic="true">
          {error ? (
            <p className="text-danger" role="alert">{error}</p>
          ) : message ? (
            <p className="text-success" role="status">{message}</p>
          ) : null}
        </div>
      </div>
      <div className="product-info">
        <p className="product-category">{categoriaNombre(p.categoria)}</p>
        <h3>
          <Link to={`/producto/${p.id}`}>{p.nombre}</Link>
        </h3>
        <p className="product-format">
          {p.formato} <span>·</span>{" "}
          {p.stock > 0 ? `Quedan ${p.stock} unidades` : "Sin stock"}
        </p>
        <div className="product-bottom">
          <div>
            <strong>{dinero(precioFinal(p))}</strong>
            <del className={p.descuento > 0 ? "" : "price-placeholder"} aria-hidden={p.descuento === 0}>{p.descuento > 0 ? dinero(p.precio) : "\u00a0"}</del>
          </div>
          <button
            className="add-product"
            aria-disabled={!disponible}
            aria-label={disponible ? `Agregar ${p.nombre} al carrito` : `Sin stock: ${p.nombre}. Consultar disponibilidad`}
            onClick={agregar}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </article>
  );
}
