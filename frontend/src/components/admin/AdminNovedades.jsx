import { useEffect, useState } from "react";
import { api } from "../../services/api";
import Campo from "../Campo";
import SubirImagen from "./SubirImagen";
export default function AdminNovedades() {
  const [items, setItems] = useState([]), [data, setData] = useState(null);
  const [error, setError] = useState(""), [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  async function cargar() { try { setItems(await api("/admin/novedades")); } catch(e) { setError(e.message); } }
  useEffect(() => { cargar(); }, []);
  function nuevo() { setData({titulo:"",slug:"",bajada:"",contenido:"",fecha:new Date().toISOString().slice(0,10),imagen:"",publicado:false}); }
  async function guardar(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const { id, ...body } = data;
      await api(`/admin/novedades${id ? `/${id}` : ""}`, {method:id?"PUT":"POST",body});
      setMessage("Novedad guardada."); setData(null); await cargar();
    } catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  return <div>
    <button className="btn btn-primary mb-4" onClick={nuevo}>+ Nueva novedad</button>
    {error && <p className="alert alert-danger" role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
    {data && <form className="form-panel mb-4" onSubmit={guardar}>
      <h2>{data.id ? "Editar novedad" : "Nueva novedad"}</h2>
      {[["titulo","Título",160],["slug","Dirección del artículo (ejemplo: nuevas-tecnicas)",160],["bajada","Descripción",500],["contenido","Contenido",15000],["fecha","Fecha",undefined]].map(([name,label,max]) =>
        <Campo key={name} name={name} label={label} required maxLength={max} type={name==="fecha"?"date":"text"} as={name==="contenido"||name==="bajada"?"textarea":"input"} rows={name==="contenido"?8:3} value={data[name]} onChange={e=>setData({...data,[name]:e.target.value})} />)}
      <SubirImagen value={data.imagen} onChange={imagen=>setData(previous=>({...previous,imagen}))} onBusy={setUploading} />
      <label className="choice"><input type="checkbox" checked={data.publicado} onChange={e=>setData({...data,publicado:e.target.checked})}/> Publicar artículo</label>
      <div className="d-flex gap-3 mt-4"><button className="btn btn-primary" disabled={busy||uploading||!data.imagen}>Guardar novedad</button><button type="button" className="btn btn-outline-primary" onClick={()=>setData(null)}>Cancelar</button></div>
    </form>}
    <div className="table-responsive"><table className="table"><thead><tr><th>Título</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td>{item.titulo}</td><td>{item.fecha}</td><td>{item.publicado?"Publicado":"Borrador"}</td><td><button className="btn btn-outline-primary btn-sm" onClick={()=>setData({...item})}>Editar</button></td></tr>)}</tbody></table></div>
  </div>;
}
