import { createContext, useContext, useEffect, useState } from "react";
import { productosApi } from "../services/productosApi";
import { agregarItem, validarCantidad } from "../utils/comercio";
export const ShopContext = createContext(null);
function cargarCarrito() {
  try {
    const value = JSON.parse(localStorage.getItem("mm2-carrito") || "[]");
    return Array.isArray(value)
      ? value.filter(
          (i) =>
            Number.isInteger(i.id) &&
            Number.isInteger(i.cantidad) &&
            i.cantidad > 0,
        )
      : [];
  } catch {
    return [];
  }
}
export function ShopProvider({ children }) {
  const [productos, setProductos] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [items, setItems] = useState(cargarCarrito),
    [notice, setNotice] = useState("");
  async function recargar() {
    setLoading(true);
    setError("");
    try {
      setProductos(await productosApi.listar());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    recargar();
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("mm2-carrito", JSON.stringify(items));
    } catch {
      /* La compra sigue disponible si el navegador bloquea almacenamiento. */
    }
  }, [items]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const agregar = (p, cantidad = 1) => {
    setItems(agregarItem(items, p, cantidad));
    setNotice(`${p.nombre} agregado al carrito.`);
  };
  const cambiarCantidad = (id, cantidad) => {
    const p = productos.find((p) => p.id === id);
    if (!p)
      throw new Error(
        "Este producto ya no está disponible. Elimínalo del carrito.",
      );
    validarCantidad(cantidad, p.stock);
    setItems(items.map((i) => (i.id === id ? { ...i, cantidad } : i)));
  };
  return (
    <ShopContext.Provider
      value={{
        productos,
        loading,
        error,
        recargar,
        items,
        agregar,
        cambiarCantidad,
        eliminar: (id) => setItems(items.filter((i) => i.id !== id)),
        vaciar: () => setItems([]),
      }}
    >
      {children}
      {notice && (
        <div className="shop-toast" role="status">
          ✓ {notice}
        </div>
      )}
    </ShopContext.Provider>
  );
}
export const useShop = () => useContext(ShopContext);
