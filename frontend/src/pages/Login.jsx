import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Campo from "../components/Campo";
import { useAuth } from "../context/AuthContext";
export default function Login() {
  const [data, setData] = useState({ email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const { login } = useAuth(),
    location = useLocation(),
    navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(data);
      const from = location.state?.from;
      navigate(
        typeof from === "string" &&
          from.startsWith("/") &&
          !from.startsWith("//")
          ? from
          : "/mi-cuenta",
        { replace: true },
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-layout">
      <div className="auth-image">
        <img src="/assets/images/hero-panaderia.jpg" alt="Croissant en una cafetería" />
        <div>
          <p className="eyebrow light">BIENVENIDO A TU ESPACIO</p>
          <h2>
            Las buenas ideas
            <br />
            merecen <em>continuar.</em>
          </h2>
        </div>
      </div>
      <div className="auth-content">
        <p className="eyebrow">MI CUENTA</p>
        <h1>
          Qué bueno
          <br />
          <em>verte de nuevo.</em>
        </h1>
        <p>Accede a tus pedidos e inscripciones.</p>
        {location.state?.from === "/clases" && (
          <p role="status" className="alert alert-info">
            Inicia sesión para inscribirte en una clase.
          </p>
        )}
        <form onSubmit={submit}>
          <Campo
            name="email"
            label="Correo electrónico"
            type="email"
            autoComplete="username"
            required
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
          <Campo
            name="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />
          {error && (
            <p role="alert" className="alert alert-danger">
              {error}
            </p>
          )}
          <button className="btn btn-primary w-100" disabled={busy}>
            {busy ? "Ingresando…" : "Iniciar sesión →"}
          </button>
        </form>
        <p className="mt-4">
          ¿Primera vez por aquí? <Link to="/registro">Crea tu cuenta</Link>
        </p>
      </div>
    </section>
  );
}
