import { PenLine, Trash2 } from 'lucide-react';
import ProductMedia from '../ProductMedia';
import { categories } from '../../data/catalog';
import { money } from '../../utils/commerce';

// Busca el nombre de la categoría a partir de su id
function getCategoryName(categoryId) {
  const category = categories.find(item => item.id === categoryId);
  return category ? category.name : '';
}

// Tabla de productos del panel de administración.
// Props:
// - products: lista de productos a mostrar
// - canDelete: true si el usuario puede eliminar (solo el admin)
// - onEdit(product) / onDelete(id): acciones de cada fila
export default function ProductTable({ products, canDelete, onEdit, onDelete }) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>SKU</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>
                <div className="table-product">
                  <ProductMedia product={product} variant="thumb" />
                  <span>
                    {product.name}
                    <small>{getCategoryName(product.category)}</small>
                  </span>
                </div>
              </td>
              <td>{product.id}</td>
              <td>{money(product.price)}</td>
              <td>
                <span className={product.stock < 5 ? 'low-stock' : ''}>{product.stock}</span>
              </td>
              <td>
                <div className="row-actions">
                  <button aria-label={'Editar ' + product.name} onClick={() => onEdit(product)}>
                    <PenLine size={16} />
                  </button>
                  {canDelete && (
                    <button
                      aria-label={'Eliminar ' + product.name}
                      onClick={() => onDelete(product.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
