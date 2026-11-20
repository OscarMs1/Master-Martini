// Autenticación con JWT.
// - El access token vive SOLO en esta variable (memoria). No se guarda en localStorage ni
//   sessionStorage: un script inyectado no lo encuentra guardado y dura 15 minutos como máximo.
// - La sesión se recupera con la cookie de renovación, que es HttpOnly (JavaScript no puede leerla)
//   y SameSite=Strict. El navegador la envía sola, y solo a /api/auth.
/** Versión de la API REST. Todas las rutas del backend cuelgan de /api/v1. */
export const API = "/api/v1";

let accessToken = null;
let renovando = null;

const canal = typeof BroadcastChannel === "function" ? new BroadcastChannel("mm-auth") : null;
// Si otra pestaña cierra sesión, esta también olvida su token.
canal?.addEventListener("message", (event) => {
  if (event.data === "logout") {
    accessToken = null;
    window.dispatchEvent(new Event("session-expired"));
  }
});

export function setAccessToken(token) {
  accessToken = token || null;
}

export function avisarLogout() {
  accessToken = null;
  canal?.postMessage("logout");
}

/** Pide un access token nuevo con la cookie. Varias llamadas simultáneas comparten una petición. */
export function renovarSesion() {
  if (!renovando) {
    renovando = fetch(`${API}/auth/refresh`, { method: "POST", credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) {
          accessToken = null;
          return null;
        }
        const data = await response.json();
        accessToken = data.accessToken;
        return data;
      })
      .catch(() => null)
      .finally(() => {
        renovando = null;
      });
  }
  return renovando;
}

export async function api(path, options = {}, reintento = false) {
  try {
    const response = await fetch(`${API}${path}`, {
      ...options,
      credentials: "same-origin",
      headers: {
        ...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    });
    // Token vencido: se renueva una vez y se repite la petición.
    if (response.status === 401 && !reintento && !path.startsWith("/auth/")) {
      if (await renovarSesion()) return api(path, options, true);
    }
    const data =
      response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401 && !path.startsWith("/auth/login")) {
        accessToken = null;
        window.dispatchEvent(new Event("session-expired"));
      }
      const error = new Error(
        (response.status >= 500 ? "El servidor no está disponible en este momento. Inténtalo nuevamente." : data?.message) ||
          "No se pudo completar la solicitud. Inténtalo nuevamente.",
      );
      error.status = response.status;
      error.fields = data?.fields || {};
      throw error;
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError)
      throw new Error(
        "No podemos conectar con el servidor. Comprueba que el backend esté iniciado.",
      );
    throw error;
  }
}
