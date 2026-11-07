import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Campo from "../components/Campo";
import DatosEntrega, { entregaVacia } from "../components/DatosEntrega";
import { validarRegistro } from "../utils/validaciones";
import { authApi } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
export default function Registro() {
  const [data, setData] = useState({
      ...entregaVacia,
      password: "",
      confirmar: "",
    }),
    [errors, setErrors] = useState({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const { login } = useAuth(),
    navigate = useNavigate();
  const change = (e) => {
    const { name, value } = e.target;
    setData((actual) => ({
      ...actual,
      [name]: value,
      ...(name === "region" ? { comuna: "" } : {}),
    }));
    setErrors((actual) => ({
      ...actual,
      [name]: undefined,
      ...(name === "region" ? { comuna: undefined } : {}),
    }));
  };
  async function submit(e) {
    e.preventDefault();
    const validation = validarRegistro(data);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setBusy(true);
    setError("");
    try {
      const { confirmar, ...payload } = data;
      await authApi.registro(payload);
      await login({ email: data.email, password: data.password });
      navigate("/mi-cuenta");
    } catch (e) {
      setError(e.message);
      setErrors(e.fields || {});
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="container-xl section">
      <div className="form-panel wide">
        <p className="eyebrow">UN NUEVO COMIENZO</p>
        <h1>
          Tu próxima idea
          <br />
          <em>empieza aquí.</em>
        </h1>
        <p>Guarda tus datos de entrega y accede a clases y pedidos.</p>
        <form onSubmit={submit} noValidate>
          <DatosEntrega data={data} onChange={change} errors={errors} />
          <div className="row">
            <div className="col-md-6">
              <Campo
                name="password"
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={data.password}
                onChange={change}
                error={errors.password}
                required
              />
            </div>
            <div className="col-md-6">
              <Campo
                name="confirmar"
                label="Confirmar contraseña"
                type="password"
                autoComplete="new-password"
                value={data.confirmar}
                onChange={change}
                error={errors.confirmar}
                required
              />
            </div>
          </div>
          <p className="small">
            Usa de 10 a 72 caracteres con letras y números. Todos los campos son
            obligatorios. Este es un entorno de práctica: evita ingresar
            información personal real.
          </p>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <button disabled={busy} className="btn btn-primary">
            {busy ? "Creando cuenta…" : "Crear mi cuenta →"}
          </button>
        </form>
        <p className="mt-4">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </section>
  );
}
