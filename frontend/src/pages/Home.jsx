import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Hero from "../components/home/Hero";
import Categorias from "../components/home/Categorias";
import Beneficios from "../components/home/Beneficios";
import ProductosDestacados from "../components/home/ProductosDestacados";
import useNovedades from "../services/useNovedades";
import Estado from "../components/Estado";
import { imagenParaNovedad, altParaNovedad } from "../data/imagenesNovedades";
export default function Home() {
  const { articulos, loading, error } = useNovedades();
  return (
    <>
      <Hero />
      <div className="brand-strip">
        <div className="container-xl">
          <Link to="/catalogo?categoria=panaderia">Panadería &amp; Pastelería</Link>
          <Link to="/catalogo?categoria=gelateria">Gelatería</Link>
          <Link to="/catalogo?categoria=food-service">Food Service</Link>
          <Link to="/catalogo?categoria=retail">Retail</Link>
        </div>
      </div>
      <Categorias />
      <section className="story-section">
        <div className="container-xl row g-0 mx-auto">
          <div className="col-md-6 story-photo">
            <img
              src="/assets/images/amasado.jpg"
              alt="Manos trabajando una masa artesanal"
              loading="lazy"
            />
            <span>LA PASIÓN SE TRABAJA CON LAS MANOS.</span>
          </div>
          <div className="col-md-6 story-copy">
            <p className="eyebrow">DE ITALIA, CON OFICIO</p>
            <h2>
              Detrás de cada creación,
              <br />
              <em>una buena historia.</em>
            </h2>
            <p>
              Master Martini es la marca de Unigrà dedicada al mundo profesional
              de la pastelería y la panadería. Una tradición que conecta
              ingredientes, experiencia y ganas de crear.
            </p>
            <Link to="/nosotros" className="text-link">
              Conoce nuestra esencia <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <ProductosDestacados />
      <section className="offer-band"><div className="container-xl offer-inner">
        <div>
          <p className="eyebrow light">MÁS INSPIRACIÓN, MEJOR PRECIO</p>
          <h2>
            Tu próxima creación
            <br />
            <em>empieza con una oportunidad.</em>
          </h2>
        </div>
        <Link className="btn btn-gold" to="/ofertas">
          Explorar ofertas <ArrowUpRight size={18} />
        </Link></div>
      </section>
      <Beneficios />
      <section className="class-feature">
        <img
          src="/assets/images/chef-gustavo-fring.jpg"
          alt="Chef terminando un postre con una manga pastelera"
          loading="lazy"
        />
        <div className="class-feature-copy">
          <p className="eyebrow light">APRENDER. COMPARTIR. CREAR.</p>
          <h2>
            El siguiente paso
            <br />
            en tu <em>oficio.</em>
          </h2>
          <p>
            Hay cosas que se aprenden haciendo.
            <br />
            Encuentra tu próxima clase e inspírate
            <br />
            con nuevas técnicas.
          </p>
          <Link className="btn btn-light" to="/clases">
            Descubrir las clases <ArrowRight size={18} />
          </Link>
          
        </div>
      </section>
      <section className="section container-xl home-novedades">
        <div className="section-heading">
          <div>
            <p className="eyebrow">NUESTRO CUADERNO</p>
            <h2>
              Ideas que <em>inspiran.</em>
            </h2>
          </div>
          <Link className="text-link" to="/novedades">
            Todas las historias <ArrowRight size={18} />
          </Link>
        </div>
        <Estado loading={loading} error={error}>
        <div className="row g-4">
          {articulos.map((a) => (
            <div className="col-md-4" key={a.slug}>
              <Link className="editorial-card" to={`/novedades/${a.slug}`}>
                <img
                  src={imagenParaNovedad(a)}
                  alt={altParaNovedad(a)}
                  loading="lazy"
                />
                <p className="eyebrow">{new Intl.DateTimeFormat('es-CL', {dateStyle:'long'}).format(new Date(a.fecha + 'T12:00:00'))}</p>
                <h3>
                  {a.titulo} <ArrowUpRight size={20} />
                </h3>
                <p>{a.bajada}</p>
              </Link>
            </div>
          ))}
        </div>
        </Estado>
      </section>
    </>
  );
}
