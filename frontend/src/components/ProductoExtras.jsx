import { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import EditorEnriquecido from "./admin/EditorEnriquecido";
import { aHtml, limpiarHtml } from "../utils/contenidoEnriquecido";

/** Largo del texto que se lee (sin formato). El backend valida lo mismo: 10 a 500 caracteres. */
const largoTexto = (html) => new DOMParser().parseFromString(`<body>${html}</body>`, "text/html").body.textContent.trim().length;

export default function ProductoExtras({ producto }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  // Cambia al publicar para que el editor TipTap se vacíe.
  const [editorKey, setEditorKey] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState(false);
  const [checked, setChecked] = useState(false);
  const refresh = async () => {
    const r = await api(`/resenas/producto/${producto.id}`);
    setReviews(r);
  };
  useEffect(() => {
    let active = true;
    setReviews(null);setFavorite(false);setError("");setMessage("");setComment("");setChecked(false);setAvailable(false);
    Promise.all([api(`/resenas/producto/${producto.id}`), user ? api("/favoritos") : Promise.resolve([])])
      .then(([r, favorites]) => {
        if (!active) return;
        setReviews(r);setAvailable(true);setChecked(true);
        setFavorite(favorites.some((f) => Number(f.productoId) === producto.id));
      })
      .catch((e) => { if (active) {setAvailable(false);setChecked(true);setError(e.message);} });
    return () => {active = false;};
  }, [producto.id, user?.id]);
  const toggleFavorite = async () => {
    setBusy(true);setError("");setMessage("");
    try {
      if (favorite) await api(`/favoritos/${producto.id}`, { method: "DELETE" });
      else await api(`/favoritos/${producto.id}`, { method: "POST" });
      setFavorite(!favorite);
      setMessage(favorite ? "Se quitó de favoritos." : "Producto guardado en favoritos.");
    } catch (e) {setError(e.message);} finally {setBusy(false);}
  };
  const deleteReview = async (id) => {
    if (!window.confirm("¿Eliminar esta opinión?")) return;
    setBusy(true);setError("");setMessage("");
    try {await api(`/resenas/${id}`, { method: "DELETE" });await refresh();setMessage("Opinión eliminada.");}
    catch (e) {setError(e.message);} finally {setBusy(false);}
  };
  const sendReview = async (e) => {
    e.preventDefault();setBusy(true);setError("");setMessage("");
    try {
      await api(`/resenas/producto/${producto.id}`, { method: "POST", body: { puntuacion: Number(rating), comentario: comment.trim() } });
      await refresh();setComment("");setEditorKey((k) => k + 1);setMessage("Tu opinión quedó guardada. Puedes actualizarla cuando quieras.");
    } catch (e) {setError(e.message);} finally {setBusy(false);}
  };
  if (!checked || !available) return null;
  return (
    <div className="product-community" aria-label="Favoritos y opiniones del producto">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div>
          <p className="eyebrow mb-1">LA EXPERIENCIA DE NUESTRA COMUNIDAD</p>
          <h2 className="h3 mb-1">Opiniones sobre este ingrediente</h2>
          {reviews && <p className="mb-0 small text-muted">{reviews.cantidad ? `${Number(reviews.promedio).toFixed(1)} / 5 · ${reviews.cantidad} opinión(es)` : "Todavía no hay opiniones. Puedes dejar la primera."}</p>}
        </div>
        {user ? (
          <button type="button" className="btn btn-outline-primary product-favorite" disabled={busy || !available} onClick={toggleFavorite} aria-pressed={favorite}>
            <Heart size={17} fill={favorite ? "currentColor" : "none"} aria-hidden="true" /> {favorite ? "Guardado en favoritos" : "Guardar en favoritos"}
          </button>
        ) : <Link to="/login" className="text-link">Inicia sesión para guardar favoritos</Link>}
      </div>
      {error && <p role="alert" className="small text-danger">{error}</p>}
      {message && <p role="status" className="small text-success">{message}</p>}
      {available && <>
        {reviews?.opiniones?.length > 0 && <div className="product-review-list">
          {reviews.opiniones.map(op => <div className="product-review" key={op.id}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <strong>{op.autor}</strong><span aria-label={`${op.puntuacion} de 5 estrellas`} className="product-review-stars">{"★".repeat(op.puntuacion)}{"☆".repeat(5-op.puntuacion)}</span>
              {user && op.mia && <button type="button" disabled={busy} className="btn btn-link btn-sm" onClick={()=>deleteReview(op.id)}>Eliminar mi opinión</button>}
            </div>
            {/* Las opiniones pueden traer formato del editor; se limpian antes de mostrarlas. */}
            <div className="product-review-text prose" dangerouslySetInnerHTML={{ __html: limpiarHtml(aHtml(op.comentario)) }} />
          </div>)}
        </div>}
        {user ? <details className="product-review-write">
          <summary>Escribir o actualizar mi opinión</summary>
          <form onSubmit={sendReview} className="mt-3">
            <label className="form-label" htmlFor="review-rating">Valoración</label>
            <select className="form-select product-review-rating" id="review-rating" value={rating} onChange={e=>setRating(e.target.value)}>
              {[5,4,3,2,1].map(n=><option key={n} value={n}>{n} estrella{n===1?"":"s"}</option>)}
            </select>
            <div className="mt-3">
              <EditorEnriquecido
                key={editorKey}
                id="review-text"
                label="Tu experiencia con el producto"
                value={comment}
                onChange={setComment}
                maxLength={500}
                compacto
                enlaces={false}
                contarTexto
                minAlto="6rem"
                placeholder="Cuéntanos cómo lo utilizaste (10 a 500 caracteres)"
              />
            </div>
            <button type="submit" disabled={busy || largoTexto(comment) < 10 || largoTexto(comment) > 500} className="btn btn-primary">{busy ? "Guardando..." : "Publicar opinión"}</button>
          </form>
        </details> : <p className="small text-muted mb-0">Para escribir una opinión necesitas <Link to="/login">iniciar sesión</Link>.</p>}
      </>}
    </div>
  );
}
