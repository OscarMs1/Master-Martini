import { Link } from "react-router-dom";
export default function NoEncontrado() {
  return (
    <section className="container section state-box">
      <p className="eyebrow">404 · PÁGINA NO ENCONTRADA</p>
      <h1>
        Tomemos otro <em>camino.</em>
      </h1>
      <p>La página que buscas no está disponible.</p>
      <Link to="/" className="btn btn-primary">
        Volver al inicio →
      </Link>
    </section>
  );
}
