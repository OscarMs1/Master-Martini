import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-xl">
        <div className="row g-5">
          <div className="col-lg-5">
            <img
              className="footer-logo"
              src="/assets/logo/master-martini.png"
              alt="Master Martini"
              width="180"
              height="110"
            />
            <p className="footer-tagline">
              La inspiración es tuya.
              <br />
              Los ingredientes, nuestros.
            </p>
          </div>
          <div className="col-6 col-lg-3">
            <h2>EXPLORA</h2>
            {[
              ["/catalogo", "Nuestros productos"],
              ["/ofertas", "Selección en oferta"],
              ["/clases", "Clases de recetas"],
              ["/novedades", "Cuaderno de inspiración"],
            ].map(([to, label]) => (
              <Link key={to} to={to}>
                {label}
              </Link>
            ))}
          </div>
          <div className="col-6 col-lg-4">
            <h2>CONVERSEMOS</h2>
            <p>
              Un espacio para quienes
              <br />
              hacen de crear su oficio.
            </p>
            <Link className="footer-contact" to="/contacto">
              Contactar <ArrowUpRight size={18} />
            </Link>
            <a
              href="https://mastermartini.cl/"
              target="_blank"
              rel="noreferrer"
            >
              Visitar sitio oficial ↗
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 · Proyecto Master Martini</span>
          <span>Proyecto académico no oficial · Sin pagos reales</span>
          <Link to="/creditos">Fotografías y fuentes</Link>
        </div>
      </div>
    </footer>
  );
}
