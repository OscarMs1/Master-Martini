import { Link } from "react-router-dom";
import { ArrowRight, ArrowDown, Sprout, ChefHat, Wheat } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-photo" aria-hidden="true">
        <img
          src="/assets/images/hero-chocolate-editorial.webp"
          alt=""
          fetchPriority="high"
          decoding="async"
          width="1671"
          height="941"
        />
      </div>
      <div className="container-xl hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">INGREDIENTES PARA GRANDES CREACIONES</p>
          <h1>
            Tu pasión.
            <br />
            Nuestra esencia.
            <br />
            <em>Mil posibilidades.</em>
          </h1>
          <p className="hero-description">
            Ingredientes de la más alta calidad, asesoría especializada
            y soluciones para llevar tu oficio un paso más allá.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-gold" to="/catalogo">
              Explorar productos <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link className="text-link hero-secondary" to="/ofertas">
              Descubrir ofertas <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
          <div className="hero-values" aria-label="Nuestros valores">
            <span><Sprout aria-hidden="true" />Tradición<br />italiana</span>
            <span><ChefHat aria-hidden="true" />Inspiración<br />profesional</span>
            <span><Wheat aria-hidden="true" />Soluciones<br />a tu medida</span>
          </div>
        </div>
      </div>
      <a className="hero-scroll" href="#universo" aria-label="Descubrir nuestras líneas">
        <ArrowDown size={18} />
      </a>
    </section>
  );
}
