export const money = value =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value || 0);
export const netPrice = product =>
  Math.round(product.price * (1 - (Number(product.discount) || 0) / 100));
export const subtotal = (cart, products) =>
  cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? netPrice(product) * item.qty : 0);
  }, 0);
export const shipping = (amount, delivery = 'domicilio') =>
  delivery === 'retiro' || amount >= 50000 || amount === 0 ? 0 : 3990;
export const orderTotal = (cart, products, delivery = 'domicilio') =>
  subtotal(cart, products) + (cart.length ? shipping(subtotal(cart, products), delivery) : 0);
export function filteredProducts(products, search = '', category = 'all', onlyOffers = false) {
  const term = String(search).toLocaleLowerCase('es-CL').trim();
  return products.filter(
    p =>
      (!onlyOffers || p.discount > 0) &&
      (category === 'all' || p.category === category) &&
      [p.name, p.description, p.brand, p.id].some(t =>
        String(t).toLocaleLowerCase('es-CL').includes(term)
      )
  );
}
export function addCart(cart, product, qty = 1) {
  if (!product || !Number.isInteger(Number(product.stock)) || Number(product.stock) < 1)
    return cart;
  const amount = Number(qty);
  if (!Number.isInteger(amount) || amount < 1) return cart;
  const current = cart.find(x => x.id === product.id)?.qty || 0;
  if (current >= product.stock) return cart;
  const next = Math.min(product.stock, current + amount);
  return current
    ? cart.map(x => (x.id === product.id ? { ...x, qty: next } : x))
    : [...cart, { id: product.id, qty: next }];
}
export function setCartQuantity(cart, id, qty, products) {
  const product = products.find(x => x.id === id);
  if (!product) return cart.filter(x => x.id !== id);
  if (Number(qty) <= 0) return cart.filter(x => x.id !== id);
  const n = Math.min(product.stock, Math.max(1, Math.floor(Number(qty) || 1)));
  if (n < 1) return cart.filter(x => x.id !== id);
  return cart.map(x => (x.id === id ? { ...x, qty: n } : x)).filter(x => x.qty > 0);
}
export function validateProduct(p) {
  const errors = {};
  if (!String(p.id || '').trim()) errors.id = 'Ingresa un código SKU.';
  if (!String(p.name || '').trim()) errors.name = 'Ingresa un nombre.';
  if (!p.category) errors.category = 'Selecciona una categoría.';
  if (p.price === '' || !Number.isFinite(Number(p.price)) || Number(p.price) < 0)
    errors.price = 'El precio debe ser 0 o superior.';
  if (p.stock === '' || !Number.isInteger(Number(p.stock)) || Number(p.stock) < 0)
    errors.stock = 'El stock debe ser un entero no negativo.';
  if (!Number.isInteger(Number(p.discount)) || Number(p.discount) < 0 || Number(p.discount) > 100)
    errors.discount = 'Descuento entre 0 y 100.';
  return errors;
}
export function calculateDV(run) {
  const nums = String(run)
    .replace(/[^0-9]/g, '')
    .split('')
    .reverse();
  let s = 0;
  nums.forEach((n, i) => {
    s += Number(n) * ((i % 6) + 2);
  });
  const r = 11 - (s % 11);
  return r === 11 ? '0' : r === 10 ? 'K' : String(r);
}
export function validRun(run) {
  const v = String(run || '')
    .replace(/[.\-\s]/g, '')
    .toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(v)) return false;
  return calculateDV(v.slice(0, -1)) === v.slice(-1);
}
export const validEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
export function validateCheckout(v) {
  const e = {};
  if (!v.name?.trim() || v.name.trim().length < 3)
    e.name = 'Ingresa tu nombre completo (mínimo 3 caracteres).';
  if (!validRun(v.run)) e.run = 'RUN inválido: revisa el dígito verificador.';
  if (!validEmail(v.email)) e.email = 'Ingresa un correo válido.';
  if (!v.phone || !/^\+?[0-9\s-]{8,16}$/.test(v.phone)) e.phone = 'Ingresa un teléfono válido.';
  if (!v.region) e.region = 'Selecciona una región.';
  if (!v.commune) e.commune = 'Selecciona una comuna.';
  if (!v.address?.trim() || v.address.trim().length < 5)
    e.address = 'Ingresa una dirección completa.';
  if (!['domicilio', 'retiro'].includes(v.delivery)) e.delivery = 'Selecciona entrega.';
  return e;
}
export const hasErrors = errors => Object.keys(errors).length > 0;

// Valida el formulario de registro. Devuelve un objeto con un mensaje por cada campo con error.
export function validateRegister(data) {
  const errors = {};
  if (data.name.trim().length < 2) errors.name = 'Mínimo 2 caracteres.';
  if (data.lastName.trim().length < 2) errors.lastName = 'Mínimo 2 caracteres.';
  if (!validRun(data.run)) errors.run = 'RUN no válido.';
  if (!validEmail(data.email)) errors.email = 'Correo inválido.';
  if (data.password.length < 4 || data.password.length > 10) {
    errors.password = 'Entre 4 y 10 caracteres.';
  }
  if (data.password !== data.confirm) errors.confirm = 'Las contraseñas deben coincidir.';
  if (!data.region) errors.region = 'Obligatoria.';
  if (!data.commune) errors.commune = 'Obligatoria.';
  if (data.address.trim().length < 5) errors.address = 'Dirección incompleta.';
  return errors;
}

// Valida el formulario de contacto.
export function validateContact(data) {
  const errors = {};
  if (data.name.trim().length < 2) errors.name = 'Ingresa tu nombre.';
  if (!validEmail(data.email)) errors.email = 'Correo no válido.';
  if (!data.subject.trim()) errors.subject = 'Ingresa un asunto.';
  if (data.message.trim().length < 10) errors.message = 'Escribe al menos 10 caracteres.';
  return errors;
}

/** Integrity gate: cart must not reference deleted items or exceed stock. */
export function cartIsAvailable(cart, products) {
  return (
    Array.isArray(cart) &&
    cart.length > 0 &&
    new Set(cart.map(i => i.id)).size === cart.length &&
    cart.every(item => {
      const p = products.find(x => x.id === item.id);
      return Boolean(
        p &&
        Number.isInteger(item.qty) &&
        item.qty > 0 &&
        Number.isInteger(p.stock) &&
        p.stock >= item.qty
      );
    })
  );
}
