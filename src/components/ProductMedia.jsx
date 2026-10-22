import { useEffect, useState } from 'react';
/** Imágenes de catálogo con respaldo local y actualización al cambiar de producto. */
export default function ProductMedia({ product, variant = 'card', className = '' }) {
  const main = product?.remoteImage || product?.image || '/assets/producto-respaldo.svg';
  const backup = product?.image || '/assets/producto-respaldo.svg';
  const [src, setSrc] = useState(main);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    setSrc(main);
    setUnavailable(false);
  }, [main, product?.id]);
  const handleError = () => {
    if (src === main && main !== backup) {
      setSrc(backup);
      return;
    }
    if (src !== '/assets/producto-respaldo.svg') {
      setSrc('/assets/producto-respaldo.svg');
      return;
    }
    setUnavailable(true);
  };
  return (
    <div
      className={`mm-product-media mm-product-media--${variant} ${className}`}
      data-product={product?.id || ''}
    >
      {!unavailable ? (
        <img
          src={src}
          alt={product?.name || 'Producto'}
          onError={handleError}
          loading={variant === 'detail' ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        <div
          className="mm-product-media-error"
          role="img"
          aria-label="Imagen temporalmente no disponible"
        >
          Imagen no disponible
        </div>
      )}
      {variant === 'detail' && product?.imageNote && (
        <div className="mm-product-media-note">{product.imageNote}</div>
      )}
      {variant === 'detail' && !product?.imageNote && src === '/assets/producto-respaldo.svg' && (
        <div className="mm-product-media-note">Fotografía no disponible temporalmente.</div>
      )}
    </div>
  );
}
