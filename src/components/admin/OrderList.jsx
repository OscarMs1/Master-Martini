import { money } from '../../utils/commerce';

// Lista de pedidos. Se usa en el panel de administración y en "Mi cuenta".
// Props:
// - orders: lista de pedidos
// - emptyMessage: texto que se muestra si no hay pedidos
// - showDate: true muestra la fecha, false muestra el nombre del cliente
export default function OrderList({ orders, emptyMessage, showDate = false }) {
  if (orders.length === 0) {
    return <p className="muted">{emptyMessage}</p>;
  }

  return (
    <div className="order-list">
      {orders.map(order => (
        <div className="order-line" key={order.id}>
          <b>{order.id}</b>
          <span>
            {showDate ? new Date(order.date).toLocaleDateString('es-CL') : order.details?.name}
          </span>
          <span>{order.status}</span>
          <b>{money(order.total)}</b>
        </div>
      ))}
    </div>
  );
}
