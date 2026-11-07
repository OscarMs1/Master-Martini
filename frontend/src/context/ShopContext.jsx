import { createContext, useContext, useEffect, useState } from "react";
import { CheckCircle2, Info, PackageX, AlertCircle, X } from "lucide-react";
import { productosApi } from "../services/productosApi";
import { agregarItem, validarCantidad } from "../utils/comercio";
export const ShopContext = createContext(null);

// Un mismo aviso discreto para éxito, límite de cantidad y falta de stock.
function formatearAviso(message, type) {
  if (type === "success") {
    return { kind: "success", title: "Agregado al carrito", detail: "Producto añadido correctamente." };
  }
  if (/sin stock|no tiene stock|agotad/i.test(message)) {
    return { kind: "stock", title: "Producto agotado", detail: "Sin stock por el momento." };
  }
  const limite = message.match(/(?:Solo hay|Máximo disponible:)\s*(\d+)\s*unidades?/i);
  if (limite) {
    return { kind: "limit", title: "Límite de unidades", detail: `Solo quedan ${limite[1]} disponibles.` };
  }
  return { kind: "error", title: "No se pudo agregar", detail: message };
}
const iconosAviso = { success: CheckCircle2, limit: Info, stock: PackageX, error: AlertCircle };
function cargarCarrito() {
  try {
    const value = JSON.parse(localStorage.getItem("mm2-carrito") || "[]");
    return Array.isArray(value)
      ? value.filter((i) => Number.isInteger(i.id) && Number.isInteger(i.cantidad) && i.cantidad > 0)
      : [];
  } catch {
    return [];
  }
}
export function ShopProvider({ children }) {
  const [productos, setProductos] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [items, setItems] = useState(cargarCarrito);
  const [toast, setToast] = useState(null);
  const [toastClosing, setToastClosing] = useState(false);

  // Conserva un único aviso; nunca crea texto bajo las tarjetas.
  const avisar = (message, type = "success") => setToast(formatearAviso(message, type));
  useEffect(() => {
    if (!toast) return undefined;
    setToastClosing(false);
    const salir = window.setTimeout(() => setToastClosing(true), 3400);
    const cerrar = window.setTimeout(() => setToast(null), 3700);
    return () => { window.clearTimeout(salir); window.clearTimeout(cerrar); };
  }, [toast]);

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
  useEffect(() => { recargar(); }, []);
  useEffect(() => {
    try {
      localStorage.setItem("mm2-carrito", JSON.stringify(items));
    } catch {
      /* La compra sigue disponible si el navegador bloquea almacenamiento. */
    }
  }, [items]);

  const agregar = (p, cantidad = 1, { avisarError = true } = {}) => {
    try {
      if (Number(p.stock) <= 0) throw new Error("Este producto no tiene stock por el momento.");
      const nuevosItems = agregarItem(items, p, cantidad);
      setItems(nuevosItems);
      avisar("Producto agregado al carrito.");
    } catch (e) {
      if (avisarError) avisar(e instanceof Error ? e.message : "No se pudo agregar el producto.", "error");
      throw e;
    }
  };
  const cambiarCantidad = (id, cantidad) => {
    const p = productos.find((p) => p.id === id);
    if (!p) throw new Error("Este producto ya no está disponible. Elimínalo del carrito.");
    validarCantidad(cantidad, p.stock);
    setItems(items.map((i) => (i.id === id ? { ...i, cantidad } : i)));
  };
  return (
    <ShopContext.Provider value={{
      productos, loading, error, recargar, items, agregar, cambiarCantidad,
      eliminar: (id) => setItems(items.filter((i) => i.id !== id)),
      vaciar: () => setItems([]),
    }}>
      {children}
      {toast && (() => {
        const Icono = iconosAviso[toast.kind];
        return (
          <div
            className={`shop-toast shop-toast--${toast.kind}${toastClosing ? " shop-toast--closing" : ""}`}
            role={toast.kind === "success" ? "status" : "alert"}
            aria-atomic="true"
            data-toast-state={toast.kind}
          >
            <span className="shop-toast__icon" aria-hidden="true"><Icono size={19} strokeWidth={1.9} /></span>
            <div className="shop-toast__copy">
              <strong>{toast.title}</strong>
              <span>{toast.detail}</span>
            </div>
            <button
              className="shop-toast__close"
              type="button"
              aria-label="Cerrar notificación"
              onClick={() => setToast(null)}
            ><X size={16} strokeWidth={1.75} /></button>
          </div>
        );
      })()}
    </ShopContext.Provider>
  );
}
export const useShop = () => useContext(ShopContext);
