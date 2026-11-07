import { fallbackImagenProducto } from "../../utils/fallbackImagenProducto";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { dinero, precioFinal } from "../../utils/comercio";
import { categoriaNombre } from "../../data/editorial";

export default function TarjetaProducto({ producto: p, onAgregar }) {
  const disponible = Number(p.stock) > 0;

  function agregar() {
    // ShopContext muestra un único aviso inferior, tanto para éxito como para errores.
    // El aviso ya no forma parte de la tarjeta ni altera su altura.
    try {
      onAgregar(p);
    } catch {
      // La acción ya comunica el motivo mediante el aviso global.
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
          {p.descuento > 0 && <span className="discount-tag">−{p.descuento}%</span>}
        </Link>
      </div>
      <div className="product-info">
        <p className="product-category">{categoriaNombre(p.categoria)}</p>
        <h3><Link to={`/producto/${p.id}`}>{p.nombre}</Link></h3>
        <p className="product-format">
          {p.formato} <span>·</span>{" "}
          {disponible ? `Quedan ${p.stock} unidades` : "Sin stock"}
        </p>
        <div className="product-bottom">
          <div>
            <strong>{dinero(precioFinal(p))}</strong>
            <del className={p.descuento > 0 ? "" : "price-placeholder"} aria-hidden={p.descuento === 0}>
              {p.descuento > 0 ? dinero(p.precio) : "\u00a0"}
            </del>
          </div>
          <button
            type="button"
            className={`add-product${disponible ? "" : " is-out-of-stock"}`}
            aria-label={disponible ? `Agregar ${p.nombre} al carrito` : `Sin stock: ${p.nombre}`}
            onClick={agregar}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </article>
  );
}
