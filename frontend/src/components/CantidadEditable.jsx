import { useEffect, useState } from "react";
import { validarCantidad } from "../utils/comercio";

// Conserva el texto mientras se escribe: un campo vacío nunca se convierte en 0.
// Solo comunica cantidades válidas al carrito o al detalle del producto.
export default function CantidadEditable({
  id,
  label,
  valor,
  stock,
  onChange,
  onValidez,
  flechas = false,
  mostrarError = true,
  onErrorChange,
  describedBy,
}) {
  const [texto, setTexto] = useState(String(valor));
  const [error, setError] = useState("");

  useEffect(() => {
    setTexto(String(valor));
    setError("");
  }, [valor]);

  useEffect(() => {
    if (!stock) {
      setError("");
      onErrorChange?.("");
      onValidez?.(false);
    } else {
      try { leerCantidad(texto); onErrorChange?.(""); onValidez?.(true); }
      catch (e) { setError(e.message); onErrorChange?.(e.message); onValidez?.(false); }
    }
  }, [stock]);

  function leerCantidad(entrada) {
    if (!/^\d+$/.test(entrada)) {
      throw new Error("Ingresa una cantidad entera.");
    }
    const cantidad = Number(entrada);
    if (cantidad > stock && stock > 0)
      throw new Error(`Máximo disponible: ${stock} unidades.`);
    validarCantidad(cantidad, stock);
    return cantidad;
  }

  function editar(entrada) {
    setTexto(entrada);
    if (entrada === "") {
      setError(""); // Puede borrarse temporalmente para escribir otra cantidad.
      onErrorChange?.("Ingresa una cantidad.");
      onValidez?.(false);
      return;
    }
    try {
      const cantidad = leerCantidad(entrada);
      if (cantidad !== valor) onChange(cantidad);
      setError("");
      onErrorChange?.("");
      onValidez?.(true);
    } catch (e) {
      setError(e.message);
      onErrorChange?.(e.message);
      onValidez?.(false);
    }
  }

  function confirmar() {
    if (!stock) return;
    try {
      const cantidad = leerCantidad(texto);
      if (cantidad !== valor) onChange(cantidad);
      setTexto(String(cantidad)); // 015 pasa a 15 al terminar de editar.
      setError("");
      onErrorChange?.("");
      onValidez?.(true);
    } catch (e) {
      const mensaje = texto === "" ? "Ingresa una cantidad." : e.message;
      setError(mensaje);
      onErrorChange?.(mensaje);
      onValidez?.(false);
    }
  }

  return (
    <div className={`quantity-field${flechas ? " quantity-with-arrows" : ""}`}>
      <label className="visually-hidden" htmlFor={id}>{label}</label>
      <div className="quantity-controls">
      {flechas && <button type="button" aria-label="Disminuir cantidad" disabled={!stock || Number(texto) <= 1} onClick={() => editar(String(Math.max(1, (Number(texto) || 1) - 1)))}>‹</button>}
      <input
        id={id}
        className={`form-control quantity-input${error ? " is-invalid" : ""}`}
        type="number"
        inputMode="numeric"
        min="1"
        max={stock}
        step="1"
        autoComplete="off"
        value={texto}
        disabled={!stock}
        onChange={(e) => editar(e.target.value)}
        onBlur={confirmar}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        aria-invalid={!!error}
        aria-describedby={describedBy || (error && mostrarError ? `${id}-error` : undefined)}
      />
      {flechas && <button type="button" aria-label="Aumentar cantidad" disabled={!stock || Number(texto) >= stock} onClick={() => editar(String(Math.min(stock, (Number(texto) || 0) + 1)))}>›</button>}
      </div>
      {mostrarError && <p className="quantity-error" role="alert" id={`${id}-error`}>{stock > 0 ? error : ""}</p>}
    </div>
  );
}
