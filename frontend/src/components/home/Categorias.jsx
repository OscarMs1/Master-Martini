import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { categorias } from "../../data/editorial";
export default function Categorias() {
  return (
    <section className="section container-xl" id="universo">
      <div className="section-heading">
        <div>
          <p className="eyebrow">UN MUNDO DE POSIBILIDADES</p>
          <h2>
            Un ingrediente para
            <br />
            <em>cada gran idea.</em>
          </h2>
        </div>
        <p>
          Cuatro líneas. Una misma pasión:
          <br />
          acompañar tu forma de crear.
        </p>
      </div>
      <div className="row g-3">
        {categorias.map((c, index) => (
          <div className="col-6 col-lg-3" key={c.id}>
            <Link to={`/catalogo?categoria=${c.id}`} className="category-card">
              <img
                src={`/assets/images/${c.imagen}`}
                alt={c.nombre}
                loading="lazy"
              />
              <div className="category-copy">
                <span className="category-index">0{index + 1}</span>
                <h3>{c.nombre}</h3>
                <span className="category-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
