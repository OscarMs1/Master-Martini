import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Trash2,
  Truck,
  LockKeyhole
} from 'lucide-react';
import { useShop } from '../contexts/ShopContext';
import { Breadcrumb } from '../components/SiteLayout';
import { Field, Alert } from '../components/FormFields';
import ProductMedia from '../components/ProductMedia';
import { regions } from '../data/catalog';
import {
  money,
  netPrice,
  shipping,
  orderTotal,
  validateCheckout,
  hasErrors,
  cartIsAvailable
} from '../utils/commerce';

// Busca en el catálogo el producto de una línea del carrito
function findProduct(products, id) {
  return products.find(product => product.id === id);
}

// Resumen con los totales. Se usa en el carrito y en el checkout.
function Summary({ cart, products, total, cartSubtotal, delivery = 'domicilio' }) {
  const shippingCost = shipping(cartSubtotal, delivery);
  return (
    <aside className="summary">
      <h3>Resumen del pedido</h3>
      {cart.map(item => {
        const product = findProduct(products, item.id);
        if (!product) return null;
        return (
          <div className="summary-line" key={item.id}>
            <span>
              {product.name} <small>× {item.qty}</small>
            </span>
            <b>{money(item.qty * netPrice(product))}</b>
          </div>
        );
      })}
      <hr />
      <div className="summary-line">
        <span>Subtotal</span>
        <b>{money(cartSubtotal)}</b>
      </div>
      <div className="summary-line">
        <span>Despacho estimado</span>
        <b>{shippingCost === 0 ? 'Gratis' : money(shippingCost)}</b>
      </div>
      <div className="summary-line total">
        <b>Total</b>
        <b>{money(total)}</b>
      </div>
      <p className="summary-note">
        <LockKeyhole size={15} /> Prototipo educativo: no se realizan cobros ni envíos.
      </p>
    </aside>
  );
}

export function Cart() {
  const { cart, products, remove, changeQty, clearCart, cartSubtotal, cartTotal } = useShop();
  return (
    <>
      <Breadcrumb title="Carrito de compras" crumb="CARRITO" />
      <section className="section">
        <div className="container">
          {!cart.length ? (
            <div className="empty-state">
              <ShoppingBag size={58} />
              <h2>Tu carrito está vacío</h2>
              <p>Descubre ingredientes para tus próximas creaciones.</p>
              <Link className="btn-orange" to="/catalogo">
                Explorar catálogo <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="row g-4 align-items-start">
              {/* Grilla de Bootstrap: productos (8 columnas) y resumen (4 columnas) en escritorio */}
              <div className="col-lg-8">
                <div className="cart-table-head">
                  <h2>
                    Mis productos <small>({cart.length})</small>
                  </h2>
                  <button className="text-button" onClick={clearCart}>
                    Vaciar carrito
                  </button>
                </div>
                <div className="cart-list">
                  {cart.map(item => {
                    const product = findProduct(products, item.id);
                    if (!product) return null;
                    return (
                      <article className="cart-item" key={item.id}>
                        <Link to={'/producto/' + product.id}>
                          <ProductMedia product={product} variant="thumb" />
                        </Link>
                        <div className="cart-info">
                          <Link to={'/producto/' + product.id} className="product-name">
                            {product.name}
                          </Link>
                          <small>
                            {product.format} · {money(netPrice(product))} / unidad
                          </small>
                          <button className="delete-link" onClick={() => remove(product.id)}>
                            <Trash2 size={15} /> Eliminar
                          </button>
                        </div>
                        <div className="qty-control">
                          <button
                            onClick={() => changeQty(product.id, item.qty - 1)}
                            aria-label={'Reducir ' + product.name}
                          >
                            −
                          </button>
                          <output>{item.qty}</output>
                          <button
                            onClick={() => changeQty(product.id, item.qty + 1)}
                            aria-label={'Aumentar ' + product.name}
                          >
                            +
                          </button>
                        </div>
                        <b>{money(item.qty * netPrice(product))}</b>
                      </article>
                    );
                  })}
                </div>
                <Link to="/catalogo" className="back-link">
                  ← Seguir comprando
                </Link>
              </div>
              <div className="col-lg-4">
                <Summary
                  cart={cart}
                  products={products}
                  cartSubtotal={cartSubtotal}
                  total={cartTotal}
                />
                <Link to="/checkout" className="btn-orange btn-block">
                  Continuar al checkout <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function Checkout() {
  const { cart, products, user, checkout, cartSubtotal, cartTotal } = useShop();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(() => ({
    name: user?.name || '',
    run: user?.run || '',
    email: user?.email || '',
    phone: user?.phone || '',
    region: user?.region || '',
    commune: user?.commune || '',
    address: user?.address || '',
    delivery: 'domicilio',
    payment: 'aprobado'
  }));

  // Actualiza un campo. Si cambia la región, se borra la comuna elegida.
  const updateField = (key, value) => {
    const newData = { ...data, [key]: value };
    if (key === 'region') newData.commune = '';
    setData(newData);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const newErrors = validateCheckout(data);
    setErrors(newErrors);
    if (hasErrors(newErrors)) return;
    if (!cartIsAvailable(cart, products)) {
      setErrors({
        stock:
          'El carrito contiene artículos agotados o cantidades sin stock. Vuelve al carrito para corregirlos.'
      });
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await checkout(data, data.payment === 'rechazado');
      if (result.error) {
        setErrors({ stock: result.error });
        return;
      }
      navigate(result.success ? `/compra-exitosa/${result.id}` : '/compra-rechazada');
    } catch (error) {
      setErrors({ stock: error.message });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      <Breadcrumb title="Finalizar compra" crumb="CHECKOUT" />
      <section className="section">
        <div className="container">
          {!cart.length ? (
            <div className="empty-state">
              <ShoppingBag size={45} />
              <h2>No hay productos para comprar</h2>
              <Link to="/catalogo" className="btn-orange">
                Ver productos
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="row g-4 align-items-start">
              <div className="col-lg-8">
                <div className="checkout-fields">
                  <span className="eyebrow">PASO 1 DE 2</span>
                  <h2>Datos de entrega</h2>
                  <p className="muted">
                    Completa los campos para simular tu pedido. Si iniciaste sesión, tus datos se
                    precargan.
                  </p>
                  {/* Bootstrap: 1 columna en celular, 2 desde tablet (col-md-6) */}
                  <div className="row gx-4">
                    <Field
                      col="col-md-6"
                      label="Nombre completo *"
                      name="name"
                      placeholder="Ej. María Pérez"
                      value={data.name}
                      onChange={e => updateField('name', e.target.value)}
                      error={errors.name}
                    />
                    <Field
                      col="col-md-6"
                      label="RUN *"
                      name="run"
                      placeholder="12.345.678-5"
                      value={data.run}
                      onChange={e => updateField('run', e.target.value)}
                      error={errors.run}
                    />
                    <Field
                      col="col-md-6"
                      label="Correo electrónico *"
                      type="email"
                      name="email"
                      placeholder="correo@ejemplo.cl"
                      value={data.email}
                      onChange={e => updateField('email', e.target.value)}
                      error={errors.email}
                    />
                    <Field
                      col="col-md-6"
                      label="Teléfono *"
                      name="phone"
                      placeholder="+56912345678"
                      value={data.phone}
                      onChange={e => updateField('phone', e.target.value)}
                      error={errors.phone}
                    />
                    <Field
                      col="col-md-6"
                      label="Región *"
                      name="region"
                      as="select"
                      value={data.region}
                      onChange={e => updateField('region', e.target.value)}
                      error={errors.region}
                    >
                      <option value="">Selecciona región</option>
                      {Object.keys(regions).map(r => (
                        <option key={r}>{r}</option>
                      ))}
                    </Field>
                    <Field
                      col="col-md-6"
                      label="Comuna *"
                      name="commune"
                      as="select"
                      value={data.commune}
                      onChange={e => updateField('commune', e.target.value)}
                      error={errors.commune}
                    >
                      <option value="">Selecciona comuna</option>
                      {(regions[data.region] || []).map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </Field>
                    <div className="col-12">
                      <Field
                        label="Dirección de entrega *"
                        name="address"
                        placeholder="Calle, número, departamento"
                        value={data.address}
                        onChange={e => updateField('address', e.target.value)}
                        error={errors.address}
                      />
                    </div>
                  </div>
                  <h3 className="mt-4">Método de entrega</h3>
                  <div className="option-list">
                    <label>
                      <input
                        type="radio"
                        name="delivery"
                        checked={data.delivery === 'domicilio'}
                        onChange={() => updateField('delivery', 'domicilio')}
                      />{' '}
                      <Truck size={17} /> Despacho a domicilio
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="delivery"
                        checked={data.delivery === 'retiro'}
                        onChange={() => updateField('delivery', 'retiro')}
                      />{' '}
                      Retiro coordinado (demo)
                    </label>
                  </div>
                  <h3 className="mt-4">Simulación del pago</h3>
                  <p className="muted">No se solicitan ni almacenan tarjetas bancarias.</p>
                  <div className="option-list">
                    <label>
                      <input
                        type="radio"
                        name="payment"
                        checked={data.payment === 'aprobado'}
                        onChange={() => updateField('payment', 'aprobado')}
                      />{' '}
                      Simular pago aprobado
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="payment"
                        checked={data.payment === 'rechazado'}
                        onChange={() => updateField('payment', 'rechazado')}
                      />{' '}
                      Simular pago rechazado
                    </label>
                  </div>
                  {Object.keys(errors).length > 0 && (
                    <Alert type="danger">
                      {errors.stock || 'Revisa los campos resaltados antes de continuar.'}
                    </Alert>
                  )}
                </div>
              </div>
              <div className="col-lg-4">
                <Summary
                  cart={cart}
                  products={products}
                  cartSubtotal={cartSubtotal}
                  delivery={data.delivery}
                  total={orderTotal(cart, products, data.delivery)}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="btn-orange btn-block"
                >
                  {submitting ? 'Procesando pedido…' : 'Confirmar pedido de demostración'}{' '}
                  <ArrowRight size={17} />
                </button>
                <p className="small muted text-center mt-2">No se procesará ningún pago real.</p>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

export function PurchaseResult({ success }) {
  const { id } = useParams();
  const { orders } = useShop();
  const order = orders.find(item => item.id === id);
  if (success && !order)
    return (
      <>
        <Breadcrumb title="Pedido no encontrado" />
        <section className="section container">
          <h2>No existe el pedido solicitado.</h2>
          <Link to="/catalogo">Volver al catálogo</Link>
        </section>
      </>
    );
  return (
    <>
      <Breadcrumb
        title={success ? 'Compra exitosa' : 'No se pudo realizar el pago'}
        crumb="RESULTADO DE COMPRA"
      />
      <section className="section">
        <div className="container">
          <div className="result-panel">
            {success ? (
              <CheckCircle2 className="success-icon" size={76} />
            ) : (
              <XCircle className="error-icon" size={76} />
            )}
            <span className="eyebrow">SIMULACIÓN DE COMPRA</span>
            <h2>{success ? '¡Tu pedido fue confirmado!' : 'Pago rechazado'}</h2>
            <p>
              {success
                ? 'Tu pedido se registró correctamente en el navegador. No se efectuó un pago ni un despacho real.'
                : 'La simulación rechazó el pago. No se descontó stock ni se registró una compra.'}
            </p>
            {success && order && (
              <div className="order-details">
                <div>
                  <b>Número de pedido</b>
                  <span>{order.id}</span>
                </div>
                <div>
                  <b>Estado</b>
                  <span>{order.status}</span>
                </div>
                <div>
                  <b>Total</b>
                  <span>{money(order.total)}</span>
                </div>
              </div>
            )}
            <div className="result-actions">
              <Link className="btn-orange" to="/catalogo">
                Seguir explorando <ArrowRight size={16} />
              </Link>
              {!success && (
                <Link className="btn-outline" to="/checkout">
                  Volver a checkout
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
