import { useState } from "react";
import Campo from "./Campo";
import { api, resetCsrf } from "../services/api";

export default function CambiarPassword() {
  const [datos, setDatos] = useState({ actual: "", nueva: "", confirmar: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function guardar(event) {
    event.preventDefault();
    setError("");
    if (!datos.actual) {
      setError("Ingresa tu contraseña actual.");
      return;
    }
    if (datos.nueva.length < 10 || datos.nueva.length > 72 || !/[A-Za-z]/.test(datos.nueva) || !/\d/.test(datos.nueva)) {
      setError("La nueva contraseña debe tener entre 10 y 72 caracteres, con letras y números.");
      return;
    }
    if (datos.nueva !== datos.confirmar) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      await api("/auth/password", {
        method: "POST",
        body: { actual: datos.actual, nueva: datos.nueva },
      });
      resetCsrf();
      window.location.replace("/login?clave=actualizada");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="account-password-panel">
      <summary>
        <span>Cambiar contraseña</span>
        <span className="account-password-toggle" aria-hidden="true" />
      </summary>
      <div className="account-password-content">
        <p className="small">
          Usa una contraseña de 10 a 72 caracteres, con letras y números.
          Al guardarla tendrás que volver a iniciar sesión.
        </p>
        <form onSubmit={guardar} className="account-password-form">
          <div className="account-password-fields">
            <div className="account-password-current">
              <Campo
                name="actual"
                label="Contraseña actual"
                type="password"
                autoComplete="current-password"
                value={datos.actual}
                onChange={(e) => setDatos((prev) => ({ ...prev, actual: e.target.value }))}
                required
              />
            </div>
            <Campo
              name="nueva"
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              value={datos.nueva}
              minLength={10}
              maxLength={72}
              onChange={(e) => setDatos((prev) => ({ ...prev, nueva: e.target.value }))}
              required
            />
            <Campo
              name="confirmar"
              label="Repetir nueva contraseña"
              type="password"
              autoComplete="new-password"
              value={datos.confirmar}
              minLength={10}
              maxLength={72}
              onChange={(e) => setDatos((prev) => ({ ...prev, confirmar: e.target.value }))}
              required
            />
          </div>
          {error && <p role="alert" className="text-danger">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Guardando…" : "Actualizar contraseña →"}
          </button>
        </form>
      </div>
    </details>
  );
}
