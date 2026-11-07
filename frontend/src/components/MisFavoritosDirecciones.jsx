import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import { api } from "../services/api";
import DatosEntrega, { entregaVacia } from "./DatosEntrega";
import { validarEntrega } from "../utils/validaciones";
import { regionCanonica, esUbicacionValida } from "../data/regionesComunasChile";

export default function MisFavoritosDirecciones() {
  const { user } = useAuth();
  const { productos } = useShop();
  const [favorites, setFavorites] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(() => {
    const initial = Object.fromEntries(Object.keys(entregaVacia).map(k => [k, user?.[k] || ""]));
    initial.region = regionCanonica(initial.region);
    if (!esUbicacionValida(initial.region, initial.comuna)) initial.comuna = "";
    return initial;
  });
  const [label, setLabel] = useState("Casa");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const refresh = async () => {
    const [f, a] = await Promise.all([api("/favoritos"), api("/direcciones")]);
    setFavorites(f);setAddresses(a);
  };
  useEffect(() => {let active=true;Promise.all([api("/favoritos"),api("/direcciones")])
    .then(([f,a])=>{if(active){setFavorites(f);setAddresses(a);setReady(true);}})
    .catch(e=>{if(active){setReady(false);setError(e.message);}});return()=>{active=false;};}, []);
  const guardar = async (e) => {
    e.preventDefault();const v = validarEntrega(form);setErrors(v);if(Object.keys(v).length)return;
    setBusy(true);setError("");setMessage("");
    try {await api("/direcciones",{method:"POST",body:{...form,etiqueta:label}});await refresh();setMessage("Dirección guardada correctamente.");}
    catch(e){setError(e.message);}finally{setBusy(false);}
  };
  const quitarFavorito = async (id) => {
    setBusy(true);setError("");setMessage("");
    try {await api(`/favoritos/${id}`,{method:"DELETE"});await refresh();setMessage("Producto quitado de favoritos.");}
    catch(e){setError(e.message);}finally{setBusy(false);}
  };
  const eliminar = async (id) => {
    if(!window.confirm("¿Eliminar esta dirección guardada?"))return;
    setBusy(true);setError("");setMessage("");
    try {await api(`/direcciones/${id}`,{method:"DELETE"});await refresh();setMessage("Dirección eliminada.");}
    catch(e){setError(e.message);}finally{setBusy(false);}
  };
  if (!ready) return null;
  return <section className="account-additions mt-5">
    <h2>Mis favoritos</h2>
    {favorites.length ? <div className="account-favorites">{favorites.map(f=>{
      const p=productos.find(p=>p.id===Number(f.productoId));
      return <div key={f.productoId} className="account-order account-address-item">
        <Link to={`/producto/${f.productoId}`}>{p?.nombre || `Producto #${f.productoId}`}</Link>
        <button type="button" className="btn btn-outline-primary btn-sm" disabled={busy} onClick={()=>quitarFavorito(f.productoId)}>Quitar</button>
      </div>;
    })}</div> : <p>Aún no guardas productos. <Link to="/catalogo">Explora el catálogo.</Link></p>}
    <h2 className="mt-5">Direcciones guardadas</h2>
    <p className="small text-muted">Guarda hasta cinco direcciones para completar más rápido tus próximas compras.</p>
    {addresses.map(a=><div key={a.id} className="account-order account-address-item">
      <div><strong>{a.etiqueta}</strong><p className="mb-0">{a.direccion}, {a.comuna}, {a.region}</p></div>
      <button type="button" disabled={busy} className="btn btn-outline-primary btn-sm" onClick={()=>eliminar(a.id)}>Eliminar</button>
    </div>)}
    {error && <p role="alert" className="text-danger small">{error}</p>}
    {message && <p role="status" className="text-success small">{message}</p>}
    {addresses.length<5 && <details className="account-address-form mt-3"><summary>Agregar una dirección</summary>
      <form onSubmit={guardar} className="mt-3" noValidate>
        <label htmlFor="address-label" className="form-label">Nombre de la dirección</label>
        <input id="address-label" className="form-control mb-3" maxLength={40} minLength={2} required value={label} onChange={e=>setLabel(e.target.value)}/>
        <DatosEntrega data={form} errors={errors} onChange={e=>{
          const {name,value}=e.target;setForm(old=>({...old,[name]:value,...(name==="region"?{comuna:""}:{})}));
          setErrors(old=>({...old,[name]:undefined}));
        }}/>
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy?"Guardando...":"Guardar dirección"}</button>
      </form>
    </details>}
  </section>;
}
