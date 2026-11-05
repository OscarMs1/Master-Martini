import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import DatosEntrega, { entregaVacia } from "../components/DatosEntrega";
import ResumenPedido from "../components/ResumenPedido";
import { validarEntrega } from "../utils/validaciones";
import { totales } from "../utils/comercio";
import { api } from "../services/api";
export default function Checkout() {
  const {
      items,
      productos,
      vaciar,
      recargar,
      loading,
      error: catalogError,
    } = useShop(),
    { user } = useAuth(),
    navigate = useNavigate();
  const [data, setData] = useState(entregaVacia),
    [entrega, setEntrega] = useState("domicilio"),
    [pago, setPago] = useState("APROBADO"),
    [errors, setErrors] = useState({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [requestKey] = useState(() => crypto.randomUUID());
  useEffect(() => {
    if (user)
      setData(
        Object.fromEntries(
          Object.keys(entregaVacia).map((key) => [key, user[key] || ""]),
        ),
      );
  }, [user]);
  async function submit(e) {
    e.preventDefault();
    const validation = validarEntrega(data);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setBusy(true);
    setError("");
    try {
      const pedido = await api("/pedidos", {
        method: "POST",
        body: { ...data, entrega, pago, requestKey, items },
      });
      if (pedido.estado === "APROBADO") {
        vaciar();
        await recargar();
      }
      navigate("/resultado-compra", { state: { pedido }, replace: true });
    } catch (e) {
      setError(e.message);
      setErrors(e.fields || {});
    } finally {
      setBusy(false);
    }
  }
  if (!items.length)
    return (
      <section className="container section state-box">
        <h1>Tu carrito está vacío</h1>
        <Link to="/catalogo" className="btn btn-primary">
          Explorar productos
        </Link>
      </section>
    );
  return (
    <section className="container-xl section">
      <p className="eyebrow">EL ÚLTIMO PASO</p>
      <h1>
        Listo para <em>crear.</em>
      </h1>
      <p>
        Compra de demostración. No se solicitarán tarjetas ni se realizarán
        cobros.
      </p>
      <form noValidate onSubmit={submit} className="row g-5 mt-2">
        <div className="col-lg-8">
          <h2 className="h3 mb-4">01. Tus datos de entrega</h2>
          <DatosEntrega
            data={data}
            errors={errors}
            onChange={(e) =>
              setData({ ...data, [e.target.name]: e.target.value })
            }
          />
          <fieldset className="my-4">
            <legend className="h3">02. ¿Cómo lo recibes?</legend>
            {[
              ["domicilio", "Despacho a domicilio"],
              ["retiro", "Retiro sin costo"],
            ].map(([value, label]) => (
              <label className="choice" key={value}>
                <input
                  type="radio"
                  name="entrega"
                  value={value}
                  checked={entrega === value}
                  onChange={() => setEntrega(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend className="h3">03. Simulación de pago</legend>
            <p className="small">
              Selecciona el resultado de la simulación de pago.
            </p>
            {[
              ["APROBADO", "Simular pago aprobado"],
              ["RECHAZADO", "Simular pago rechazado"],
            ].map(([value, label]) => (
              <label className="choice" key={value}>
                <input
                  type="radio"
                  name="pago"
                  value={value}
                  checked={pago === value}
                  onChange={() => setPago(value)}
                />
                {label}
              </label>
            ))}
          </fieldset>
        </div>
        <div className="col-lg-4">
          <aside className="summary-panel">
            <h2>Resumen</h2>
            <p>
              {items.reduce((sum, i) => sum + i.cantidad, 0)} unidades en tu
              selección
            </p>
            <ResumenPedido valores={totales(items, productos, entrega)} />
            {(error || catalogError) && (
              <p className="alert alert-danger" role="alert">
                {error || catalogError}
              </p>
            )}
            <button
              className="btn btn-primary w-100"
              disabled={busy || loading || !!catalogError}
            >
              {busy ? "Procesando…" : "Confirmar compra simulada →"}
            </button>
            <Link className="text-link mt-3" to="/carrito">
              ← Editar carrito
            </Link>
          </aside>
        </div>
      </form>
    </section>
  );
}
