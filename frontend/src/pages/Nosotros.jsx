import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import "../styles/nosotros.css";

const lineas = [
  { nombre: "Panadería & Pastelería", ruta: "/catalogo?categoria=panaderia", numero: "01" },
  { nombre: "Gelatería", ruta: "/catalogo?categoria=gelateria", numero: "02" },
  { nombre: "Food Service", ruta: "/catalogo?categoria=food-service", numero: "03" },
  { nombre: "Retail", ruta: "/catalogo?categoria=retail", numero: "04" },
];

export default function Nosotros() {
  return (
    <div className="nosotros-page">
      <section className="nosotros-mision" aria-labelledby="nosotros-titulo">
        <div className="container-xl nosotros-mision__grid">
          <div className="nosotros-mision__copy">
            <p className="eyebrow nosotros-mision__eyebrow">NUESTRA ESENCIA <span aria-hidden="true" /></p>
            <h1 id="nosotros-titulo">
              La tradición inspira.
              <em>Tu oficio transforma.</em>
            </h1>
            <p className="nosotros-mision__lead">
              Ingredientes, conocimiento y creatividad para quienes encuentran
              en cada preparación una nueva forma de expresarse.
            </p>
            <p className="nosotros-mision__description">
              Detrás de cada textura, cada receta y cada detalle hay manos que
              crean con dedicación. En Master Martini, la inspiración comienza
              por el oficio y continúa en todo lo que podemos imaginar.
            </p>
            <Link className="btn btn-primary nosotros-mision__cta" to="/catalogo">
              Explorar nuestras líneas <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <div className="nosotros-mision__visual">
            <div className="nosotros-mision__figure">
              <div className="nosotros-mision__shape" aria-hidden="true" />
              <img
                src="/assets/images/nosotros-oficio.jpg"
                alt="Panadero profesional trabajando junto a hornos y panes recién horneados en una cocina de producción"
                width="2400"
                height="1600"
              />
              <div className="nosotros-mision__dots" aria-hidden="true" />
              <span className="nosotros-mision__accent" aria-hidden="true" />
            </div>
            <p className="nosotros-mision__caption">LA PASIÓN SE TRABAJA CON LAS MANOS</p>
          </div>
        </div>
      </section>

      <section className="nosotros-historia" aria-labelledby="nosotros-historia-titulo">
        <div className="container-xl">
          <header className="nosotros-historia__heading">
            <p className="eyebrow">UNA HISTORIA ITALIANA</p>
            <h2 id="nosotros-historia-titulo">
              Raíces que inspiran.
              <em>Ideas que evolucionan.</em>
            </h2>
          </header>
          <div className="nosotros-historia__grid">
            <div className="nosotros-historia__origen">
              <span className="nosotros-historia__year">1982</span>
              <span className="nosotros-historia__year-caption">El inicio de nuestra historia</span>
              <span className="nosotros-historia__rule" aria-hidden="true" />
            </div>
            <div className="nosotros-historia__copy">
              <h3>Ingredientes al servicio de la <em>creatividad.</em></h3>
              <p>
                Master Martini nació en 1982 como marca de Unigrà para el
                sector profesional de la pastelería y la panadería. Su
                propuesta reúne materias primas e ingredientes para acompañar
                distintas formas de elaboración.
              </p>
              <p>
                En Chile, la filial de Unigrà presenta soluciones en cuatro
                líneas: Panadería &amp; Pastelería, Gelatería, Food Service y Retail.
                Una oferta pensada para distintas especialidades y formas de crear.
              </p>
              <Link to="/catalogo" className="text-link nosotros-historia__link">
                Descubrir nuestros productos <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="nosotros-lineas" aria-labelledby="nosotros-lineas-titulo">
        <div className="container-xl">
          <div className="nosotros-lineas__heading">
            <div>
              <p className="eyebrow">PARA CADA ESPECIALIDAD</p>
              <h2 id="nosotros-lineas-titulo">Cuatro maneras de <em>crear.</em></h2>
            </div>
            <p>Explora las líneas que acompañan el trabajo de cada profesional.</p>
          </div>
          <div className="nosotros-lineas__grid">
            {lineas.map(({ nombre, ruta, numero }) => (
              <Link key={ruta} className="nosotros-lineas__item" to={ruta}>
                <span className="nosotros-lineas__number">{numero}</span>
                <span className="nosotros-lineas__name">{nombre}</span>
                <ArrowUpRight aria-hidden="true" size={20} />
              </Link>
            ))}
          </div>
          <div className="source-note nosotros-fuentes">
            Información contrastada en{" "}
            <a href="https://mastermartini.cl/" target="_blank" rel="noreferrer">
              Master Martini Chile
            </a>{" "}
            y{" "}
            <a href="https://www.martiniprofessional.cl/master-martini/" target="_blank" rel="noreferrer">
              Martini Professional
            </a>.
            {" "}Proyecto académico no oficial, sin vinculación comercial.
          </div>
        </div>
      </section>
    </div>
  );
}
