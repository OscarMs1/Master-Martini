import { api, resetCsrf } from "./api";
export const authApi = {
  me: () => api("/auth/me"),
  registro: (body) => api("/auth/registro", { method: "POST", body }),
  async login(body) {
    const user = await api("/auth/login", { method: "POST", body });
    resetCsrf();
    return user;
  },
  async logout() {
    await api("/auth/logout", { method: "POST" });
    resetCsrf();
  },
};
