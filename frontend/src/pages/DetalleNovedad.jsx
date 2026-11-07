import { Link, useParams } from "react-router-dom";
import useNovedades from "../services/useNovedades";
import Estado from "../components/Estado";
import NoEncontrado from "./NoEncontrado";
import { imagenParaNovedad } from "../data/imagenesNovedades";
import { collageParaNovedad } from "../data/collagesNovedades";
import "../styles/novedades-collage.css";

const editoriales = {
  "el-arte-del-laminado": {
    categoria: "Panadería y pastelería",
    etiqueta: "El oficio detrás de cada capa",
    tituloOriginal: "El arte de las mil capas.",
    tituloInicio: "El arte de las",
    tituloFinal: "mil capas.",
    subtitulo: "La precisión se construye paso a paso.",
    seccion: "Temperatura, técnica y paciencia",
    variante: "laminado",
  },
  "texturas-de-chocolate": {
    categoria: "Chocolate y repostería",
    etiqueta: "El lenguaje de las texturas",
    tituloOriginal: "Chocolate. Un mundo de texturas.",
    tituloInicio: "Chocolate. Un mundo",
    tituloFinal: "de texturas.",
    subtitulo: "La terminación también cuenta una historia.",
    seccion: "Contrastes que transforman un postre",
    variante: "chocolate",
  },
  "un-gelato-con-identidad": {
    categoria: "Gelatería",
    etiqueta: "Ideas para crear nuevos sabores",
    tituloOriginal: "Un gelato con identidad.",
    tituloInicio: "Un gelato",
    tituloFinal: "con identidad.",
    subtitulo: "Todo comienza con un sabor. El equilibrio hace el resto.",
    seccion: "Sabor, textura y equilibrio",
    variante: "gelato",
  },
};

const formatearFecha = (fecha) => {
  if (!fecha) return "";
  const parsed = new Date(`${fecha}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? ""
    : new Intl.DateTimeFormat("es-CL", { dateStyle: "long" }).format(parsed);
};

const SIZES_COLLAGE = [
  "(max-width: 767px) 72vw, (max-width: 1100px) 36vw, 31vw",
  "(max-width: 767px) 50vw, (max-width: 1100px) 27vw, 24vw",
  "(max-width: 767px) 47vw, (max-width: 1100px) 24vw, 22vw",
];

export default function DetalleNovedad() {
  const { articulos, loading, error } = useNovedades();
  const { slug } = useParams();
  const articulo = articulos.find((item) => item.slug === slug);

  if (loading || error) return <Estado loading={loading} error={error} />;
  if (!articulo) return <NoEncontrado />;

  const tema = editoriales[slug];
  const parrafos = (articulo.contenido || "")
    .split(/\n\s*\n/)
    .map((texto) => texto.trim())
    .filter(Boolean);
  const textoPrincipal = parrafos[0] || articulo.bajada;
  const textoSecundario = parrafos.slice(1);
  const fotos = collageParaNovedad(articulo);
  const fechaLegible = formatearFecha(articulo.fecha);
  const tituloConEnfasis = tema && articulo.titulo === tema.tituloOriginal;
  const otrasNovedades = articulos.filter((item) => item.slug !== slug).slice(0, 2);

  return (
    <article className={`novedad-detalle novedad-editorial ${tema ? `novedad-editorial--${tema.variante}` : ""}`}>
      <div className="container-xl novedad-editorial__container">
        <nav className="novedad-editorial__nav" aria-label="Navegación de novedades">
          <Link to="/novedades" className="text-link novedad-editorial__volver">
            <span aria-hidden="true">←</span> Volver a novedades
          </Link>
        </nav>

        <div className="novedad-editorial__hero">
          <header className="novedad-editorial__presentacion">
            <p className="eyebrow novedad-editorial__eyebrow">
              {tema?.categoria || "Novedades"} <span aria-hidden="true">/</span> Cuaderno de inspiración
            </p>
            <h1>
              {tituloConEnfasis ? (
                <>
                  <span>{tema.tituloInicio}</span>{" "}
                  <em>{tema.tituloFinal}</em>
                </>
              ) : (
                articulo.titulo
              )}
            </h1>
            <p className="novedad-editorial__bajada">{articulo.bajada}</p>
            <p className="novedad-editorial__introduccion">{textoPrincipal}</p>
            <div className="novedad-editorial__acciones">
              <a className="btn btn-primary novedad-editorial__cta" href="#novedad-contenido">
                Descubrir la historia <span aria-hidden="true">↗</span>
              </a>
              {fechaLegible && <time dateTime={articulo.fecha} className="novedad-editorial__fecha">{fechaLegible}</time>}
            </div>
          </header>

          <figure className="novedad-editorial__collage" aria-label={`Collage fotográfico de ${articulo.titulo}`}>
            {fotos.map((imagen, index) => (
              <div
                key={imagen.src}
                className={`novedad-editorial__collage-photo novedad-editorial__collage-photo--${["principal", "superior", "inferior"][index] || "inferior"}`}
              >
                <img
                  src={imagen.src}
                  srcSet={imagen.srcSet}
                  sizes={imagen.srcSet ? SIZES_COLLAGE[index] || SIZES_COLLAGE[2] : undefined}
                  alt={imagen.alt}
                  loading="eager"
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              </div>
            ))}
          </figure>
        </div>
      </div>

      <section className="novedad-editorial__lectura" id="novedad-contenido" aria-labelledby="novedad-editorial-titulo-lectura">
        <div className="container-xl novedad-editorial__lectura-grid">
          <div className="novedad-editorial__aside">
            <p className="eyebrow">Notas de oficio</p>
            <h2 id="novedad-editorial-titulo-lectura">{tema?.seccion || "Una historia para seguir creando"}</h2>
            <div className="novedad-editorial__linea" aria-hidden="true" />
            <p>{tema?.subtitulo || articulo.bajada}</p>
          </div>
          <div className="novedad-editorial__cuerpo prose">
            {(textoSecundario.length ? textoSecundario : [textoPrincipal]).map((parrafo, index) => (
              <p key={`${index}-${parrafo.slice(0, 24)}`}>{parrafo}</p>
            ))}
            <Link to="/clases" className="text-link novedad-editorial__aprender">
              Seguir aprendiendo <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {otrasNovedades.length > 0 && (
        <section className="container-xl novedad-editorial__otras" aria-label="Otras novedades">
          <div className="novedad-editorial__otras-cabecera">
            <div>
              <p className="eyebrow">También puede interesarte</p>
              <h2>Más ideas para inspirarte.</h2>
            </div>
            <Link className="text-link" to="/novedades">Ver todas las novedades ↗</Link>
          </div>
          <div className="novedad-editorial__otras-grid">
            {otrasNovedades.map((item) => (
              <Link className="novedad-editorial__otra" key={item.slug} to={`/novedades/${item.slug}`}>
                <img src={imagenParaNovedad(item)} alt="" loading="lazy" />
                <div>
                  <span className="eyebrow">Novedades</span>
                  <h3>{item.titulo}</h3>
                  <span className="text-link">Leer historia ↗</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
