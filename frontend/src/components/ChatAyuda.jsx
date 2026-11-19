import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChefHat, Send, X } from "lucide-react";
import { api } from "../services/api";
import "../styles/chat-ayuda.css";

const CLAVE = "mm-chat-ayuda";
const MAX_TEXTO = 1200;
const HISTORIAL = 12; // el backend acepta como máximo 12 mensajes
const SALUDO = {
  rol: "assistant",
  texto: "¡Ciao! Soy Martini, el asistente de Master Martini. ¿Buscas un producto, una clase o ayuda con tu compra?",
};
const SUGERENCIAS = ["¿Qué ofertas hay?", "¿Cuándo son las próximas clases?", "¿Cómo hago un pedido?"];

// Rutas internas que el asistente puede mencionar; se convierten en enlaces.
const RUTA = /(\/(?:catalogo|ofertas|clases|novedades|nosotros|contacto|carrito|mi-cuenta|login|registro|producto\/\d+)\b)/g;

function leer() {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(CLAVE));
    if (Array.isArray(guardado) && guardado.length) return guardado;
  } catch {
    /* sin almacenamiento */
  }
  return [SALUDO];
}

function Texto({ texto, onNavegar }) {
  return texto.split("\n").map((linea, i) => {
    const item = /^[-•*]\s+/.test(linea);
    const partes = linea
      .replace(/^[-•*]\s+/, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .split(RUTA)
      .map((p, j) => (j % 2 === 1 ? <Link key={j} to={p} onClick={onNavegar}>{p}</Link> : p));
    return (
      <span key={i} className={item ? "chat-li" : "chat-p"}>{partes}</span>
    );
  });
}

export default function ChatAyuda() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState(leer);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const lista = useRef(null);
  const entrada = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(mensajes.slice(-30)));
    } catch {
      /* sin almacenamiento */
    }
  }, [mensajes]);

  useEffect(() => {
    if (!abierto) return;
    const el = lista.current;
    if (el?.scrollTo) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    else if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes, cargando, abierto]);

  useEffect(() => {
    if (abierto) entrada.current?.focus();
    const esc = (e) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierto]);

  async function enviar(pregunta) {
    const limpio = pregunta.trim().slice(0, MAX_TEXTO);
    if (!limpio || cargando) return;
    const nuevos = [...mensajes, { rol: "user", texto: limpio }];
    setMensajes(nuevos);
    setTexto("");
    setError("");
    setCargando(true);
    try {
      // Turnos alternados, empezando por el usuario (el saludo se omite en el backend).
      const data = await api("/asistente", { method: "POST", body: { mensajes: nuevos.slice(-HISTORIAL) } });
      setMensajes((m) => [...m, { rol: "assistant", texto: data.respuesta }]);
    } catch (e) {
      setError(
        e.status === 503
          ? "El asistente no está disponible por ahora. Puedes escribirnos desde Contacto."
          : e.message || "No pude responder. Inténtalo de nuevo.",
      );
      setMensajes((m) => m.slice(0, -1)); // se devuelve la pregunta al campo para reintentar
      setTexto(limpio);
    } finally {
      setCargando(false);
    }
  }

  function reiniciar() {
    setMensajes([SALUDO]);
    setError("");
  }

  return (
    <div className={`chat-ayuda ${abierto ? "abierto" : ""}`}>
      {abierto && (
        <section className="chat-panel" role="dialog" aria-label="Asistente de ayuda">
          <header className="chat-cabecera">
            <span className="chat-avatar" aria-hidden="true"><ChefHat size={20} /></span>
            <div>
              <strong>Martini</strong>
              <small>Asistente virtual · puede equivocarse</small>
            </div>
            <button type="button" className="chat-reiniciar" onClick={reiniciar}>Nueva charla</button>
            <button type="button" className="chat-cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar asistente">
              <X size={18} />
            </button>
          </header>

          <div className="chat-mensajes" ref={lista} aria-live="polite">
            {mensajes.map((m, i) => (
              <div key={i} className={`chat-burbuja ${m.rol === "user" ? "yo" : "bot"}`}>
                {m.rol === "user" ? m.texto : <Texto texto={m.texto} onNavegar={() => setAbierto(false)} />}
              </div>
            ))}
            {cargando && (
              <div className="chat-burbuja bot chat-escribiendo" aria-label="Escribiendo">
                <i /><i /><i />
              </div>
            )}
            {mensajes.length === 1 && !cargando && (
              <div className="chat-sugerencias">
                {SUGERENCIAS.map((s) => (
                  <button key={s} type="button" onClick={() => enviar(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>

          {error && <div className="chat-error" role="alert">{error}</div>}

          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              enviar(texto);
            }}
          >
            <label className="visually-hidden" htmlFor="chat-pregunta">Escribe tu pregunta</label>
            <textarea
              id="chat-pregunta"
              ref={entrada}
              rows={1}
              value={texto}
              maxLength={MAX_TEXTO}
              placeholder="Escribe tu pregunta…"
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar(texto);
                }
              }}
            />
            <button type="submit" disabled={cargando || !texto.trim()} aria-label="Enviar pregunta">
              <Send size={18} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="chat-lanzador"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-label={abierto ? "Cerrar asistente" : "Abrir asistente de ayuda"}
      >
        {abierto ? <X size={24} /> : <ChefHat size={26} />}
      </button>
    </div>
  );
}
