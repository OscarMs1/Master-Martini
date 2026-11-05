import { fallbackImagenProducto } from "../utils/fallbackImagenProducto";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ArrowRight } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { dinero, precioFinal, totales } from "../utils/comercio";
import ResumenPedido from "../components/ResumenPedido";
import Estado from "../components/Estado";
import CantidadEditable from "../components/CantidadEditable";
export default function Carrito() {
  const {
      items,
      productos,
      loading,
      error,
      recargar,
      cambiarCantidad,
      eliminar,
      vaciar,
    } = useShop(),
    [message, setMessage] = useState("");
  const [camposInvalidos, setCamposInvalidos] = useState([]);
  const cambiarValidez = (id, valida) => {
    setCamposInvalidos((anteriores) => {
      const siguientes = anteriores.filter((actual) => actual !== id);
      return valida ? siguientes : [...siguientes, id];
    });
  };
  const invalid = items.some(
    (i) => !productos.find((p) => p.id === i.id && p.stock >= i.cantidad),
  );
  return (
    <section className="container-xl section">
      <p className="eyebrow">CADA INGREDIENTE CUENTA</p>
      <h1>
        Tu <em>carrito.</em>
      </h1>
      <Estado loading={loading} error={error} retry={recargar}>
        {!items.length ? (
          <div className="state-box">
            <h2>Tu carrito está vacío.</h2>
            <p>Agrega los ingredientes de tu próxima creación.</p>
            <Link className="btn btn-primary" to="/catalogo">
              Explorar productos <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="row g-5 mt-2">
            <div className="col-lg-8">
              {message && (
                <p className="alert alert-danger" role="alert">
                  {message}
                </p>
              )}
              {items.map((i) => {
                const p = productos.find((p) => p.id === i.id);
                return (
                  <article className="cart-row" key={i.id}>
                    {p && <img src={p.imagen} alt={p.nombre} onError={fallbackImagenProducto} />}
                    <div className="cart-description">
                      <h2>
                        {p ? (
                          <Link to={`/producto/${p.id}`}>{p.nombre}</Link>
                        ) : (
                          "Producto retirado del catálogo"
                        )}
                      </h2>
                      <p>{p?.formato}</p>
                      {p && <strong>{dinero(precioFinal(p))}</strong>}
                    </div>
                    <CantidadEditable
                      id={`cantidad-${i.id}`}
                      label={`Cantidad de ${p?.nombre || i.id}`}
                      valor={i.cantidad}
                      stock={p?.stock ?? 0}
                      onValidez={(valida) => cambiarValidez(i.id, valida)}
                      onChange={(nuevaCantidad) => {
                        try {
                          cambiarCantidad(i.id, nuevaCantidad);
                          setMessage("");
                        } catch (e) {
                          setMessage(e.message);
                          throw e;
                        }
                      }}
                    />
                    <button
                      className="icon-button"
                      aria-label={`Eliminar ${p?.nombre || "producto"}`}
                      onClick={() => {
                        eliminar(i.id);
                        setCamposInvalidos((anteriores) =>
                          anteriores.filter((id) => id !== i.id),
                        );
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </article>
                );
              })}
              <button
                className="text-button mt-4"
                onClick={() => {
                  vaciar();
                  setCamposInvalidos([]);
                }}
              >
                Vaciar carrito
              </button>
            </div>
            <div className="col-lg-4">
              <aside className="summary-panel">
                <h2>Tu selección</h2>
                <ResumenPedido valores={totales(items, productos)} />
                <p className="small">
                  En esta simulación, el despacho cuesta $3.990 y es gratis
                  desde $50.000. También puedes elegir retiro.
                </p>
                {invalid || camposInvalidos.some((id) => items.some((i) => i.id === id)) ? (
                  <p role="alert" className="text-danger">
                    Revisa las cantidades: deben ser enteros entre 1 y el stock
                    disponible, y todos los productos deben seguir disponibles.
                  </p>
                ) : (
                  <Link className="btn btn-primary w-100" to="/checkout">
                    Continuar con la compra →
                  </Link>
                )}
                <Link className="text-link mt-3" to="/catalogo">
                  Seguir explorando
                </Link>
              </aside>
            </div>
          </div>
        )}
      </Estado>
    </section>
  );
}
