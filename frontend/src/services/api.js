let csrf;
export async function api(path, options = {}) {
  const method = options.method || "GET";
  try {
    if (!["GET", "HEAD"].includes(method) && !csrf) {
      const response = await fetch("/api/auth/csrf", {
        credentials: "include",
      });
      if (!response.ok)
        throw new Error("No se pudo iniciar una conexión segura.");
      csrf = await response.json();
    }
    const response = await fetch(`/api${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
        ...(csrf && { [csrf.headerName]: csrf.token }),
        ...options.headers,
      },
      body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    });
    const data =
      response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401) {
        csrf = undefined;
        window.dispatchEvent(new Event("session-expired"));
      }
      if (response.status === 403) csrf = undefined;
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
export function resetCsrf() {
  csrf = undefined;
}
