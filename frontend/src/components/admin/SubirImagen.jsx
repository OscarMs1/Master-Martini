import { useState } from "react";
import { api } from "../../services/api";
export default function SubirImagen({ value, onChange, onBusy }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function subir(file) {
    if (!file) return;
    setError("");
    if (!/\.(jpe?g|png|webp)$/i.test(file.name) || file.size > 5 * 1024 * 1024) {
      setError("Selecciona JPG, PNG o WEBP de hasta 5 MB."); return;
    }
    setBusy(true); onBusy?.(true);
    try {
      const body = new FormData(); body.append("archivo", file);
      const result = await api("/admin/imagenes", { method: "POST", body });
      onChange(result.url);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); onBusy?.(false); }
  }
  return <div className="image-upload mb-4" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (!busy) subir(e.dataTransfer.files[0]); }}>
    <label className="form-label" htmlFor="archivo-imagen">Fotografía del producto o artículo</label>
    <input id="archivo-imagen" className="form-control" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => subir(e.target.files[0])} />
    <p className="small mt-2">Selecciona o arrastra una imagen JPG, PNG o WEBP, hasta 5 MB. Usa fotografías que tengas permiso para publicar.</p>
    {busy && <p role="status">Subiendo fotografía…</p>}
    {error && <p role="alert" className="text-danger">{error}</p>}
    {value && <img src={value} alt="Vista previa de la fotografía guardada" style={{ width: 220, maxWidth: "100%", height: 150, objectFit: "contain" }} />}
  </div>;
}
