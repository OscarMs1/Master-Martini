import { Link, useLocation } from "react-router-dom";
import { Check, X } from "lucide-react";
import ResumenPedido from "../components/ResumenPedido";
export default function ResultadoCompra() {
  const pedido = useLocation().state?.pedido;
  if (!pedido)
    return (
      <section className="container section state-box">
        <h1>No hay una compra para mostrar</h1>
        <Link to="/mi-cuenta">Revisar mis pedidos</Link>
      </section>
    );
  const ok = pedido.estado === "APROBADO";
  return (
    <section className="container section">
      <div className="result-panel">
        <div className={`result-icon ${ok ? "" : "rejected"}`}>
          {ok ? <Check size={32} /> : <X size={32} />}
        </div>
        <p className="eyebrow">PEDIDO #{pedido.id}</p>
        <h1>
          {ok ? (
            <>
              Tu próxima creación
              <br />
              <em>ya está en camino.</em>
            </>
          ) : (
            <>
              Esta vez
              <br />
              <em>no se pudo completar.</em>
            </>
          )}
        </h1>
        <p>
          {ok
            ? "Compra simulada aprobada. Tu pedido quedó guardado y el stock fue actualizado."
            : "Pago simulado rechazado. Conservamos tu carrito y no descontamos existencias."}
        </p>
        <div className="text-start">
          {pedido.lineas.map((l) => (
            <p key={l.productoId}>
              {l.cantidad} × {l.nombre}
            </p>
          ))}
          <ResumenPedido valores={pedido} />
        </div>
        <p className="academic-note">
          No se realizó ningún cobro ni se enviará un despacho real.
        </p>
        <Link className="btn btn-primary" to={ok ? "/catalogo" : "/checkout"}>
          {ok ? "Seguir descubriendo" : "Volver a intentar"} →
        </Link>
        <Link className="text-link ms-3" to="/mi-cuenta">
          Mi cuenta
        </Link>
      </div>
    </section>
  );
}
