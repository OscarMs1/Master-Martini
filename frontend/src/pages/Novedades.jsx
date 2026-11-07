import { Link } from "react-router-dom";
import useNovedades from "../services/useNovedades";
import Estado from "../components/Estado";
import { imagenParaNovedad, altParaNovedad } from "../data/imagenesNovedades";

export default function Novedades() {
  const { articulos, loading, error } = useNovedades();

  return (
    <>
      <section className="page-heading">
        <div className="container-xl">
          <p className="eyebrow">EL CUADERNO DE INSPIRACIÓN</p>
          <h1>
            Ideas para seguir
            <br />
            <em>creando.</em>
          </h1>
          <p>Notas de oficio y pequeñas historias alrededor de la cocina.</p>
        </div>
      </section>

      <section className="container-xl section novedades-listado">
        <Estado loading={loading} error={error} />
        <div className="row g-4 g-xl-5 novedades-grid">
          {articulos.map((articulo) => (
            <div key={articulo.slug} className="col-md-4 d-flex">
              <Link className="editorial-card novedad-card" to={`/novedades/${articulo.slug}`}>
                <img loading="lazy" src={imagenParaNovedad(articulo)} alt={altParaNovedad(articulo)} />
                <div className="novedad-card-copy">
                  <p className="eyebrow">{new Intl.DateTimeFormat('es-CL', {dateStyle:'long'}).format(new Date(articulo.fecha + 'T12:00:00'))}</p>
                  <h2>{articulo.titulo}</h2>
                  <p className="novedad-card-extracto">{articulo.bajada}</p>
                  <span className="text-link">Leer historia ↗</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
