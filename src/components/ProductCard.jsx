import { Link } from 'react-router';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { money, netPrice } from '../utils/commerce';
import ProductMedia from './ProductMedia';

// Tarjeta de un producto. Recibe el producto y la función onAdd por props.
export default function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card" data-testid="product-card">
      <Link to={'/producto/' + product.id} className="product-photo">
        <ProductMedia product={product} />
        {product.discount > 0 && <span className="sale-tag">-{product.discount}%</span>}
      </Link>
      <div className="product-body">
        <small className="muted">
          {product.brand || 'Master Martini'} · {product.format || 'Unidad'}
        </small>
        <Link className="product-name" to={'/producto/' + product.id}>
          {product.name}
        </Link>
        <p>{product.description}</p>
        {product.imageNote && (
          <small className="product-reference">Imagen referencial · detalles en la ficha</small>
        )}
        <div className="product-price">
          {money(netPrice(product))} {product.discount > 0 && <del>{money(product.price)}</del>}
        </div>
        <div className="product-buttons">
          <button
            type="button"
            className="btn-orange"
            onClick={() => onAdd?.(product)}
            disabled={!product.stock}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart size={16} />
            {product.stock ? 'Agregar' : 'Sin stock'}
          </button>
          <Link
            className="view-small"
            to={'/producto/' + product.id}
            aria-label={'Ver ' + product.name}
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// Grilla responsiva de Bootstrap: 1 columna en celular, 2 en tablet, 3-4 en escritorio
export function ProductGrid({ products, onAdd }) {
  return (
    <div className="row g-3 g-lg-4 product-bootstrap-grid">
      {products.map(product => (
        <div key={product.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <ProductCard product={product} onAdd={onAdd} />
        </div>
      ))}
    </div>
  );
}
