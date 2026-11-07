import { useState } from "react";
import Campo from "../components/Campo";
import { validarContacto } from "../utils/validaciones";
import { api } from "../services/api";
export default function Contacto() {
  const [data, setData] = useState({
      nombre: "",
      email: "",
      asunto: "",
      mensaje: "",
    }),
    [errors, setErrors] = useState({}),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setSuccess("");
    const validation = validarContacto(data);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setBusy(true);
    setError("");
    try {
      await api("/contactos", { method: "POST", body: data });
      setSuccess(
        "Tu mensaje se registró correctamente en esta plataforma.",
      );
      setData({ nombre: "", email: "", asunto: "", mensaje: "" });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="contact-page-background">
      <section className="container-xl section contact-page">
        <div className="row g-5">
          <div className="col-lg-5">
            <p className="eyebrow">ESTAMOS PARA CONVERSAR</p>
            <h1>
              Las buenas ideas
              <br />
              empiezan con
              <br />
              <em>un hola.</em>
            </h1>
            <p className="lead">Cuéntanos qué tienes en mente.</p>
            <div className="contact-details">
              <h2>Contacto oficial de la marca</h2>
              <p>
                Américo Vespucio 1385
                <br />
                Centro SpacioFlex, Módulo 3<br />
                Quilicura, Santiago
              </p>
              <a href="tel:+56226611700">+56 2 2661 1700</a>
              <a href="mailto:clientes@mastermartini.cl">
                clientes@mastermartini.cl
              </a>
              <p>Lunes a viernes · 09:00–18:00</p>
              <a
                href="https://mastermartini.cl/contacto/"
                target="_blank"
                rel="noreferrer"
              >
                Consultar sitio oficial ↗
              </a>
            </div>
          </div>
          <div className="col-lg-7">
            <div className="form-panel">
              <h2>Déjanos un mensaje</h2>
              <p>
                Este formulario registra mensajes en esta plataforma. Para
                comunicarte directamente con la marca, utiliza su sitio oficial.
              </p>
              <form onSubmit={submit} noValidate>
                {[
                  ["nombre", "Tu nombre"],
                  ["email", "Correo electrónico"],
                  ["asunto", "Asunto"],
                  ["mensaje", "Mensaje"],
                ].map(([name, label]) => (
                  <Campo
                    key={name}
                    name={name}
                    label={label}
                    type={name === "email" ? "email" : "text"}
                    as={name === "mensaje" ? "textarea" : "input"}
                    rows={name === "mensaje" ? 5 : undefined}
                    maxLength={name === "mensaje" ? 2000 : 120}
                    value={data[name]}
                    error={errors[name]}
                    onChange={(e) => setData({ ...data, [name]: e.target.value })}
                    required
                  />
                ))}
                {error && (
                  <p role="alert" className="alert alert-danger">
                    {error}
                  </p>
                )}
                {success && (
                  <p role="status" className="alert alert-success">
                    {success}
                  </p>
                )}
                <button className="btn btn-primary" disabled={busy}>
                  {busy ? "Guardando…" : "Guardar mensaje →"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
