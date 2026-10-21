import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initialProducts, refreshCatalogProductMedia } from '../data/catalog';
import {
  readStore,
  writeStore,
  createProduct,
  updateProduct,
  deleteProduct
} from '../utils/storage';
import {
  addCart,
  setCartQuantity,
  subtotal,
  orderTotal,
  cartIsAvailable,
  netPrice,
  validateCheckout,
  validateProduct,
  hasErrors
} from '../utils/commerce';
const ShopContext = createContext(null);
const apiEnabled = () => typeof window !== 'undefined' && window.__MM_API_ENABLED__ === true;
async function apiRequest(path, method = 'GET', body) {
  const response = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Error al conectar con la API local.');
  }
  return response.json();
}
export function ShopProvider({ children }) {
  const [products, setProducts] = useState(() => {
    const v = readStore('mm-ep2-products', initialProducts);
    if (!Array.isArray(v) || !v.every(p => p && typeof p.id === 'string')) return initialProducts;
    return refreshCatalogProductMedia(v);
  });
  const [cart, setCart] = useState(() => {
    const v = readStore('mm-ep2-cart', []);
    return Array.isArray(v) &&
      v.every(x => x && typeof x.id === 'string' && Number.isInteger(x.qty) && x.qty > 0)
      ? v
      : [];
  });
  const [user, setUser] = useState(() => {
    const v = readStore('mm-ep2-user', null);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  });
  const [orders, setOrders] = useState(() => {
    const v = readStore('mm-ep2-orders', []);
    return Array.isArray(v) ? v : [];
  });
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(apiEnabled);
  const [apiError, setApiError] = useState('');
  useEffect(() => {
    if (!apiEnabled()) return;
    let active = true;
    Promise.all([apiRequest('/products'), apiRequest('/orders')])
      .then(([catalog, history]) => {
        if (
          !Array.isArray(catalog) ||
          catalog.some(p => !p || hasErrors(validateProduct(p))) ||
          !Array.isArray(history)
        )
          throw new Error('Respuesta API inválida.');
        if (active) {
          setProducts(refreshCatalogProductMedia(catalog));
          setOrders(history);
        }
      })
      .catch(error => {
        if (active) {
          setApiError(error.message);
          setToast('API no disponible. Inicia npm run api.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    writeStore('mm-ep2-products', products);
  }, [products]);
  useEffect(() => {
    writeStore('mm-ep2-cart', cart);
  }, [cart]);
  useEffect(() => {
    writeStore('mm-ep2-user', user);
  }, [user]);
  useEffect(() => {
    writeStore('mm-ep2-orders', orders);
  }, [orders]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3800);
    return () => clearTimeout(t);
  }, [toast]);
  const add = (product, qty = 1) => {
    if (!product || product.stock === 0) {
      setToast('No hay stock disponible.');
      return;
    }
    const qtyCurrent = cart.find(x => x.id === product.id)?.qty || 0;
    if (qtyCurrent >= product.stock) {
      setToast('Alcanzaste el stock disponible.');
      return;
    }
    setCart(prev => addCart(prev, product, qty));
    setToast(`${product.name} añadido al carrito.`);
  };
  const changeQty = (id, qty) => setCart(prev => setCartQuantity(prev, id, qty, products));
  const remove = id => setCart(prev => prev.filter(x => x.id !== id));
  const saveProduct = async (p, isEdit = false) => {
    if (hasErrors(validateProduct(p))) throw new Error('Datos de producto inválidos.');
    if (!isEdit && products.some(x => x.id === p.id)) throw new Error('El SKU ya existe.');
    if (isEdit && !products.some(x => x.id === p.id)) throw new Error('Producto inexistente.');
    if (apiEnabled())
      await apiRequest(
        isEdit ? '/products/' + encodeURIComponent(p.id) : '/products',
        isEdit ? 'PUT' : 'POST',
        p
      );
    setProducts(prev => (isEdit ? updateProduct(prev, p.id, p) : createProduct(prev, p)));
  };
  const eraseProduct = async id => {
    if (apiEnabled()) await apiRequest('/products/' + encodeURIComponent(id), 'DELETE');
    setProducts(prev => deleteProduct(prev, id));
    setCart(prev => prev.filter(x => x.id !== id));
  };
  const resetCatalog = async () => {
    if (apiEnabled()) await apiRequest('/reset', 'POST');
    setProducts(initialProducts);
    setCart([]);
    setToast('Catálogo de demostración restaurado.');
  };
  const checkout = async (details, forceFail = false) => {
    if (hasErrors(validateCheckout(details)))
      return { success: false, id: null, error: 'Revisa los datos de entrega.' };
    if (loading || apiError)
      return {
        success: false,
        id: null,
        error: 'La API no está disponible para confirmar el pedido.'
      };
    if (forceFail) {
      setToast('Pago rechazado en la simulación.');
      return { success: false, id: null };
    }
    if (!cartIsAvailable(cart, products)) {
      setToast('Revisa las cantidades y el stock disponible antes de comprar.');
      return { success: false, id: null };
    }
    if (apiEnabled()) {
      const result = await apiRequest('/checkout', 'POST', {
        details,
        cart,
        userId: user?.email || null
      });
      setOrders(prev => [result.order, ...prev]);
      setProducts(result.products);
      setCart([]);
      return { success: true, id: result.order.id };
    }
    const order = {
      id: `PED-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      userId: user?.email || null,
      details,
      items: cart.map(i => {
        const p = products.find(x => x.id === i.id);
        return { ...i, name: p?.name || i.id, price: netPrice(p) };
      }),
      total: orderTotal(cart, products, details.delivery),
      status: 'Aprobado (simulado)'
    };
    setOrders(prev => [order, ...prev]);
    setProducts(prev =>
      prev.map(p => ({
        ...p,
        stock: Math.max(0, p.stock - (cart.find(i => i.id === p.id)?.qty || 0))
      }))
    );
    setCart([]);
    setToast('Compra de demostración confirmada.');
    return { success: true, id: order.id };
  };
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const value = useMemo(
    () => ({
      products,
      cart,
      user,
      orders,
      toast,
      loading,
      apiError,
      setToast,
      setUser,
      add,
      changeQty,
      remove,
      clearCart: () => setCart([]),
      saveProduct,
      eraseProduct,
      resetCatalog,
      checkout,
      cartCount,
      cartSubtotal: subtotal(cart, products),
      cartTotal: orderTotal(cart, products)
    }),
    [products, cart, user, orders, toast, loading, apiError]
  );
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
export const useShop = () => {
  const v = useContext(ShopContext);
  if (!v) throw new Error('useShop requiere ShopProvider');
  return v;
};
