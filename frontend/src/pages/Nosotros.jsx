import { Link } from "react-router-dom";
export default function Nosotros() {
  return (
    <>
      <section className="page-heading">
        <div className="container-xl">
          <p className="eyebrow">NUESTRA ESENCIA</p>
          <h1>
            La tradición inspira.
            <br />
            <em>Tu oficio transforma.</em>
          </h1>
        </div>
      </section>
      <section className="container-xl section">
        <div className="row g-5 align-items-center">
          <div className="col-md-6">
            <img
              className="editorial-portrait"
              src="/assets/images/nosotros-oficio.jpg"
              alt="Trabajo artesanal de una masa"
            />
          </div>
          <div className="col-md-6 prose">
            <p className="eyebrow">UNA HISTORIA ITALIANA</p>
            <h2>
              Ingredientes al servicio
              <br />
              de la <em>creatividad.</em>
            </h2>
            <p>
              Master Martini nació en 1982 como marca de Unigrà para el sector
              profesional de la pastelería y la panadería. Su propuesta reúne
              materias primas e ingredientes para acompañar distintas formas de
              elaboración.
            </p>
            <p>
              En Chile, la filial de Unigrà presenta soluciones en cuatro
              líneas: Panadería & Pastelería, Gelatería, Food Service y Retail.
            </p>
            <p>
              Explora ingredientes, descubre ideas para tus preparaciones y
              encuentra nuevas oportunidades para seguir aprendiendo.
            </p>
            <Link to="/catalogo" className="btn btn-primary">
              Explorar nuestras líneas →
            </Link>
          </div>
        </div>
        <div className="source-note">
          Información contrastada en{" "}
          <a href="https://mastermartini.cl/" target="_blank" rel="noreferrer">
            Master Martini Chile
          </a>{" "}
          y{" "}
          <a
            href="https://www.martiniprofessional.cl/master-martini/"
            target="_blank"
            rel="noreferrer"
          >
            Martini Professional
          </a>
          . Proyecto académico no oficial, sin vinculación comercial.
        </div>
      </section>
    </>
  );
}
