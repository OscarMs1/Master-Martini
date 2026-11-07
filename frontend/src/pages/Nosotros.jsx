import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import "../styles/nosotros.css";

const lineas = [
  { numero: "01", nombre: "Panadería & Pastelería", ruta: "/catalogo?categoria=panaderia", detalle: "Masas, coberturas y creaciones dulces" },
  { numero: "02", nombre: "Gelatería", ruta: "/catalogo?categoria=gelateria", detalle: "Texturas, sabores y nuevas combinaciones" },
  { numero: "03", nombre: "Food Service", ruta: "/catalogo?categoria=food-service", detalle: "Soluciones para la cocina profesional" },
  { numero: "04", nombre: "Retail", ruta: "/catalogo?categoria=retail", detalle: "Ingredientes para cada inspiración" },
];

export default function Nosotros() {
  return (
    <div className="nosotros-page">
      <section className="nosotros-presentacion" aria-labelledby="nosotros-titulo">
        <div className="container-xl nosotros-presentacion__inner">
          <div className="nosotros-presentacion__simbolo" aria-hidden="true">
            <svg className="nosotros-presentacion__estrella" viewBox="0 0 126 112" focusable="false">
              <defs>
                <pattern id="nosotros-estrella-puntos" width="4" height="4" patternUnits="userSpaceOnUse">
                  <circle cx="1.5" cy="1.5" r="0.4" fill="#DCAD83" opacity="0.25" />
                </pattern>
              </defs>
              <circle cx="50" cy="49" r="31" fill="#F7D3A5" />
              <circle cx="50" cy="49" r="31" fill="url(#nosotros-estrella-puntos)" />
              <path
                d="M63.8 35.4 C65.8 31.7 68.5 31.7 70.6 35.5 L82.5 52.8 L103.5 56.2 C109.1 57.1 109.3 60.5 105.2 64.0 L90.5 76.0 L93.3 94.7 C94.1 100.0 90.9 101.0 86.6 98.7 L67.0 88.9 L47.5 98.9 C43.0 101.2 40.8 98.8 42.1 94.0 L46.5 75.7 L31.8 63.0 C27.6 59.4 29.5 56.0 35.1 55.1 L55.8 52.6 Z"
                fill="none"
                stroke="#052B67"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 id="nosotros-titulo">Lo que hacemos</h1>
          <p>
            Creemos que detrás de cada gran creación hay una idea, unas manos
            dedicadas y los ingredientes adecuados. En Master Martini reunimos
            tradición, conocimiento e inspiración para acompañar el trabajo
            de quienes hacen de la gastronomía su oficio.
          </p>
        </div>
      </section>

      <section className="nosotros-relato" aria-labelledby="nosotros-oficio-titulo">
        <div className="container-xl nosotros-relato__grid">
          <figure className="nosotros-relato__foto nosotros-relato__foto--verde">
            <img
              src="/assets/images/nosotros-oficio.jpg"
              alt="Profesional de panadería trabajando con pan recién horneado en un obrador"
              width="1600"
              height="1067"
              fetchPriority="high"
            />
            <figcaption>EL VALOR DE HACER LAS COSAS BIEN</figcaption>
          </figure>
          <div className="nosotros-relato__contenido">
            <p className="nosotros-relato__sobrelinea">Nuestra esencia</p>
            <h2 id="nosotros-oficio-titulo">El oficio detrás de cada creación.</h2>
            <p className="nosotros-relato__subtitulo">La pasión se encuentra en los detalles.</p>
            <p>
              Desde el primer ingrediente hasta el toque final, cada preparación
              tiene su propio proceso. Nos inspiran la dedicación, la técnica y
              la creatividad que convierten lo cotidiano en algo especial.
            </p>
            <p>
              Por eso, este espacio acerca productos, recetas e ideas a quienes
              disfrutan aprender, experimentar y compartir lo que hacen.
            </p>
            <Link to="/catalogo" className="nosotros-relato__enlace">
              Explorar nuestros productos <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="nosotros-relato nosotros-relato--inverso" aria-labelledby="nosotros-historia-titulo">
        <div className="container-xl nosotros-relato__grid">
          <figure className="nosotros-relato__foto nosotros-relato__foto--oro">
            <img
              src="/assets/images/inicio-laminado.jpg"
              alt="Manos trabajando una masa de panadería sobre una mesa enharinada"
              width="2400"
              height="1600"
              loading="lazy"
            />
            <figcaption>TRADICIÓN, TÉCNICA Y CREATIVIDAD</figcaption>
          </figure>
          <div className="nosotros-relato__contenido">
            <p className="nosotros-relato__sobrelinea">Nuestra historia</p>
            <h2 id="nosotros-historia-titulo">Raíces italianas. Ideas que evolucionan.</h2>
            <p className="nosotros-relato__subtitulo">Una historia que comienza en 1982.</p>
            <p>
              Master Martini nació como una marca de Unigrà orientada a los
              profesionales de la panadería y la pastelería. Con el paso del
              tiempo, su propuesta ha acompañado distintas especialidades y
              formas de elaborar.
            </p>
            <p>
              Hoy, en Chile, sus líneas incluyen Panadería &amp; Pastelería,
              Gelatería, Food Service y Retail: diferentes caminos unidos
              por las ganas de crear.
            </p>
            <Link to="/novedades" className="nosotros-relato__enlace">
              Conocer nuestras ideas <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="nosotros-especialidades" aria-labelledby="nosotros-especialidades-titulo">
        <div className="container-xl">
          <header className="nosotros-especialidades__cabecera">
            <div className="nosotros-especialidades__icono" aria-hidden="true">
              <Sparkles size={25} strokeWidth={1.5} />
            </div>
            <p className="nosotros-especialidades__sobrelinea">Descubre nuestras líneas</p>
            <h2 id="nosotros-especialidades-titulo">Un mundo de posibilidades.</h2>
            <p>Cuatro especialidades para explorar ingredientes y encontrar nuevas formas de crear.</p>
          </header>
          <div className="nosotros-especialidades__lista">
            {lineas.map(({ numero, nombre, detalle, ruta }) => (
              <Link to={ruta} className="nosotros-especialidades__item" key={ruta}>
                <span className="nosotros-especialidades__numero">{numero}</span>
                <span className="nosotros-especialidades__nombre">{nombre}</span>
                <span className="nosotros-especialidades__detalle">{detalle}</span>
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
