import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import DatosEntrega, { entregaVacia } from "../components/DatosEntrega";
import ResumenPedido from "../components/ResumenPedido";
import { validarEntrega } from "../utils/validaciones";
import { esUbicacionValida, regionCanonica } from "../data/regionesComunasChile";
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
  const [direccionesGuardadas, setDireccionesGuardadas] = useState([]);
  useEffect(() => {
    let active = true;
    if (!user) { setDireccionesGuardadas([]); return undefined; }
    api("/direcciones").then(list => { if(active) setDireccionesGuardadas(list); }).catch(() => {});
    return () => { active=false; };
  }, [user?.id]);
  useEffect(() => {
    if (user) {
      const guardados = Object.fromEntries(
        Object.keys(entregaVacia).map((key) => [key, user[key] || ""]),
      );
      guardados.region = regionCanonica(guardados.region);
      if (!esUbicacionValida(guardados.region, guardados.comuna)) {
        guardados.comuna = "";
      }
      setData(guardados);
    }
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
          {direccionesGuardadas.length > 0 && <div className="mb-3">
            <label className="form-label" htmlFor="checkout-saved-address">Usar una dirección guardada</label>
            <select id="checkout-saved-address" className="form-select" defaultValue="" onChange={e=>{
              const found=direccionesGuardadas.find(a=>String(a.id)===e.target.value);
              const source=found || user || entregaVacia;
              const next=Object.fromEntries(Object.keys(entregaVacia).map(k=>[k,source[k]||""]));
              next.region=regionCanonica(next.region);
              if(!esUbicacionValida(next.region,next.comuna)) next.comuna="";
              setData(next);
              setErrors({});
            }}>
              <option value="">Completar manualmente</option>
              {direccionesGuardadas.map(a=><option key={a.id} value={a.id}>{a.etiqueta} · {a.comuna}</option>)}
            </select>
          </div>}
          <DatosEntrega
            data={data}
            errors={errors}
            onChange={(e) => {
              const { name, value } = e.target;
              setData((actual) => ({
                ...actual,
                [name]: value,
                ...(name === "region" ? { comuna: "" } : {}),
              }));
              setErrors((actual) => ({
                ...actual,
                [name]: undefined,
                ...(name === "region" ? { comuna: undefined } : {}),
              }));
            }}
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
