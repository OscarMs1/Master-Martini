import { dinero } from "../utils/comercio";
export default function ResumenPedido({ valores }) {
  return (
    <dl className="order-totals">
      <div>
        <dt>Subtotal</dt>
        <dd>{dinero(valores.subtotal)}</dd>
      </div>
      <div>
        <dt>Descuentos</dt>
        <dd>−{dinero(valores.descuento)}</dd>
      </div>
      <div>
        <dt>Despacho</dt>
        <dd>{valores.despacho ? dinero(valores.despacho) : "Sin costo"}</dd>
      </div>
      <div className="total">
        <dt>Total</dt>
        <dd>{dinero(valores.total)}</dd>
      </div>
    </dl>
  );
}
