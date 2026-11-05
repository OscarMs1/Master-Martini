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
}) {
  const [texto, setTexto] = useState(String(valor));
  const [error, setError] = useState("");

  useEffect(() => {
    setTexto(String(valor));
  }, [valor]);

  function leerCantidad(entrada) {
    if (!/^\d+$/.test(entrada)) {
      throw new Error("Ingresa una cantidad entera.");
    }
    const cantidad = Number(entrada);
    validarCantidad(cantidad, stock);
    return cantidad;
  }

  function editar(entrada) {
    setTexto(entrada);
    if (entrada === "") {
      setError(""); // Puede borrarse temporalmente para escribir otra cantidad.
      onValidez?.(false);
      return;
    }
    try {
      const cantidad = leerCantidad(entrada);
      if (cantidad !== valor) onChange(cantidad);
      setError("");
      onValidez?.(true);
    } catch (e) {
      setError(e.message);
      onValidez?.(false);
    }
  }

  function confirmar() {
    try {
      const cantidad = leerCantidad(texto);
      if (cantidad !== valor) onChange(cantidad);
      setTexto(String(cantidad)); // 015 pasa a 15 al terminar de editar.
      setError("");
      onValidez?.(true);
    } catch (e) {
      setError(texto === "" ? "Ingresa una cantidad." : e.message);
      onValidez?.(false);
    }
  }

  return (
    <div className="quantity-field">
      <label className="visually-hidden" htmlFor={id}>{label}</label>
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
        onChange={(e) => editar(e.target.value)}
        onBlur={confirmar}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <p className="quantity-error" role="alert" id={`${id}-error`}>{error}</p>}
    </div>
  );
}
