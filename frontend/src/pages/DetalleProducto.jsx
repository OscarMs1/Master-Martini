import { fallbackImagenProducto } from "../utils/fallbackImagenProducto";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Info } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { dinero, precioFinal } from "../utils/comercio";
import { categoriaNombre } from "../data/editorial";
import Estado from "../components/Estado";
import CantidadEditable from "../components/CantidadEditable";
import ProductoExtras from "../components/ProductoExtras";
export default function DetalleProducto() {
  const { id } = useParams(),
    { productos, loading, error, recargar, agregar } = useShop();
  const [cantidad, setCantidad] = useState(1);
  const [cantidadValida, setCantidadValida] = useState(true);
  const [errorCantidad, setErrorCantidad] = useState("");
  const [aviso, setAviso] = useState(null);
  const p = productos.find((producto) => producto.id === Number(id));

  useEffect(() => {
    setCantidad(1);
    setCantidadValida(true);
    setErrorCantidad("");
    setAviso(null);
  }, [id]);
  useEffect(() => {
    if (!aviso) return undefined;
    const timer = window.setTimeout(() => setAviso(null), 3700);
    return () => window.clearTimeout(timer);
  }, [aviso]);
  function comprar() {
    if (!p) return;
    if (Number(p.stock) <= 0) {
      setAviso({ message: "No hay unidades disponibles para añadir." });
      return;
    }
    if (!cantidadValida) {
      setAviso({ message: errorCantidad || "Revisa la cantidad antes de continuar." });
      return;
    }
    try {
      agregar(p, cantidad, { avisarError: false });
      setAviso(null); // El éxito se muestra únicamente en el aviso global.
    } catch (e) {
      setAviso({ message: e instanceof Error ? e.message : "No se pudo agregar el producto." });
    }
  }
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
              <img src={p.imagen} onError={fallbackImagenProducto} alt={p.nombre} />
            </div>
            <div className="col-md-6">
              <p className="eyebrow">{categoriaNombre(p.categoria)}</p>
              <h1>{p.nombre}</h1>
              <p className="lead">{p.descripcion}</p>
              <p>{p.formato} · Referencia #{String(p.id).padStart(3, "0")}</p>
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
                    <span className="detail-savings">Ahorras <strong>{dinero(p.precio - precioFinal(p))}</strong></span>
                  )}
                </div>
              </div>
              <p>{p.stock ? `${p.stock} unidades disponibles` : "Temporalmente agotado"}</p>
              <div className="detail-purchase my-4">
                <CantidadEditable
                  flechas
                  key={p.id}
                  id="cantidad"
                  label={`Cantidad de ${p.nombre}`}
                  valor={cantidad}
                  stock={p.stock}
                  onChange={(valor) => { setCantidad(valor); setAviso(null); }}
                  onValidez={setCantidadValida}
                  onErrorChange={setErrorCantidad}
                  mostrarError={false}
                  describedBy="cantidad-aviso"
                />
                <div className="detail-action">
                  <button type="button" className="btn btn-outline-primary detail-add" aria-disabled={!p.stock} onClick={comprar}>
                    Agregar al carrito <ShoppingBag size={18} />
                  </button>
                </div>
                <div className="detail-action-notice" id="cantidad-aviso">
                  {(aviso || errorCantidad) && <p role="alert"><Info size={14} aria-hidden="true" /><span>{aviso?.message || errorCantidad}</span></p>}
                </div>
              </div>
              {!p.stock && <Link className="text-link" to={`/catalogo?categoria=${p.categoria}`}>Ver productos similares</Link>}
            </div>
            <div className="col-12"><ProductoExtras producto={p} /></div>
          </div>
        )}
      </Estado>
    </section>
  );
}
