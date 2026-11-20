import { api, avisarLogout, renovarSesion, setAccessToken } from "./api";
export const authApi = {
  /** Al abrir la página: recupera la sesión con la cookie de renovación, si existe. */
  async me() {
    const sesion = await renovarSesion();
    if (!sesion) {
      const error = new Error("Inicia sesión para continuar.");
      error.status = 401;
      throw error;
    }
    return sesion.usuario;
  },
  registro: (body) => api("/auth/registro", { method: "POST", body }),
  async login(body) {
    const data = await api("/auth/login", { method: "POST", body });
    setAccessToken(data.accessToken);
    return data.usuario;
  },
  async logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      avisarLogout();
    }
  },
};
