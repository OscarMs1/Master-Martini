import { Link, useParams } from "react-router-dom";
import useNovedades from "../services/useNovedades";
import Estado from "../components/Estado";
import NoEncontrado from "./NoEncontrado";

export default function DetalleNovedad() {
  const { articulos, loading, error } = useNovedades();
  const { slug } = useParams();
  const articulo = articulos.find((item) => item.slug === slug);

  if (loading || error) return <Estado loading={loading} error={error} />;
  if (!articulo) return <NoEncontrado />;

  return (
    <article className="container-xl section novedad-detalle">
      <div className="novedad-detalle-interior">
        <Link className="text-link novedad-volver" to="/novedades">
          ← Volver al cuaderno
        </Link>

        <header className="article-title novedad-encabezado">
          <p className="eyebrow">{new Intl.DateTimeFormat('es-CL', {dateStyle:'long'}).format(new Date(articulo.fecha + 'T12:00:00'))}</p>
          <h1>{articulo.titulo}</h1>
          <p className="lead">{articulo.bajada}</p>
        </header>

        <img className="article-cover novedad-foto" src={articulo.imagen} alt={articulo.titulo} />

        <div className="prose article-body novedad-cuerpo">
          {articulo.contenido.split("\n\n").map((parrafo, index) => (
            <p key={`${index}-${parrafo.slice(0, 24)}`}>{parrafo}</p>
          ))}
          <Link to="/clases" className="btn btn-primary novedad-seguir">
            Seguir aprendiendo →
          </Link>
        </div>
      </div>
    </article>
  );
}
