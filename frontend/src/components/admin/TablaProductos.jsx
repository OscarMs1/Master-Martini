import { dinero } from "../../utils/comercio";
export default function TablaProductos({ productos, editar, eliminar }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <caption>Catálogo de productos de demostración</caption>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Producto</th>
            <th scope="col">Precio</th>
            <th scope="col">Descuento</th>
            <th scope="col">Stock</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>
                <strong>{p.nombre}</strong>
                <small className="d-block">{p.formato}</small>
              </td>
              <td>{dinero(p.precio)}</td>
              <td>{p.descuento}%</td>
              <td>
                <span className={`pill ${p.stock === 0 ? "pill-danger" : ""}`}>
                  {p.stock === 0 ? "Agotado" : p.stock <= 5 ? `${p.stock} · Stock bajo` : p.stock}
                </span>
              </td>
              <td>
                <div className="d-flex gap-3">
                  <button
                    className="text-button"
                    onClick={() => editar(p)}
                    aria-label={`Editar ${p.nombre}`}
                  >
                    Editar
                  </button>
                  <button
                    className="text-button text-danger"
                    onClick={() => eliminar(p)}
                    aria-label={`Eliminar ${p.nombre}`}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
