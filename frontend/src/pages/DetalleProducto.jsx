import { fallbackImagenProducto } from "../utils/fallbackImagenProducto";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { dinero, precioFinal } from "../utils/comercio";
import { categoriaNombre } from "../data/editorial";
import Estado from "../components/Estado";
import CantidadEditable from "../components/CantidadEditable";
export default function DetalleProducto() {
  const { id } = useParams(),
    { productos, loading, error, recargar, agregar } = useShop();
  const [cantidad, setCantidad] = useState(1),
    [cantidadValida, setCantidadValida] = useState(true),
    [message, setMessage] = useState("");
  const p = productos.find((p) => p.id === Number(id));
  useEffect(() => {
    setCantidad(1);
    setCantidadValida(true);
    setMessage("");
  }, [id]);
  return (
    <section className="container-xl section product-detail">
      <Link className="text-link mb-4" to="/catalogo">
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>
      <Estado loading={loading} error={error} retry={recargar}>
        {!p ? (
          <div className="state-box">
            <h1>Producto no encontrado</h1>
            <p>Puede haber sido retirado del catálogo.</p>
          </div>
        ) : (
          <div className="row g-5 align-items-center">
            <div className="col-md-6 detail-image">
              <img
                src={p.imagen}
                onError={fallbackImagenProducto}
                alt={p.nombre}
              />
            </div>
            <div className="col-md-6">
              <p className="eyebrow">{categoriaNombre(p.categoria)}</p>
              <h1>{p.nombre}</h1>
              <p className="lead">{p.descripcion}</p>
              <p>
                {p.formato} · Referencia #{String(p.id).padStart(3, "0")}
              </p>
              <div className="detail-price">
                {p.descuento > 0 && (
                  <div className="detail-price-top">
                    <del className="detail-price-original">{dinero(p.precio)}</del>
                    <span className="detail-discount-badge">-{p.descuento}%</span>
                  </div>
                )}
                <div className="detail-price-bottom">
                  <span className="detail-price-current">{dinero(precioFinal(p))}</span>
                  {p.descuento > 0 && (
                    <span className="detail-savings">
                      Ahorras <strong>{dinero(p.precio - precioFinal(p))}</strong>
                    </span>
                  )}
                </div>
              </div>
              <p>
                {p.stock
                  ? `${p.stock} unidades disponibles`
                  : "Sin stock por el momento"}
              </p>
              <div className="d-flex gap-3 my-4">
                <CantidadEditable
                  key={p.id}
                  id="cantidad"
                  label={`Cantidad de ${p.nombre}`}
                  valor={cantidad}
                  stock={p.stock}
                  onChange={setCantidad}
                  onValidez={setCantidadValida}
                />
                <button
                  className="btn btn-primary"
                  disabled={!p.stock || !cantidadValida}
                  onClick={() => {
                    try {
                      agregar(p, cantidad);
                      setMessage("");
                    } catch (e) {
                      setMessage(e.message);
                    }
                  }}
                >
                  Agregar al carrito <ShoppingBag size={18} />
                </button>
              </div>
              {message && (
                <p role="alert" className="text-danger">
                  {message}
                </p>
              )}
              {!p.stock && <Link className="text-link" to={`/catalogo?categoria=${p.categoria}`}>Ver productos similares</Link>}
            </div>
          </div>
        )}
      </Estado>
    </section>
  );
}
