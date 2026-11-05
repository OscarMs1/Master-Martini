import { api } from "./api";
export const productosApi = {
  listar: () => api("/productos"),
  obtener: (id) => api(`/productos/${id}`),
  crear: (data) => api("/productos", { method: "POST", body: data }),
  editar: (id, data) => api(`/productos/${id}`, { method: "PUT", body: data }),
  eliminar: (id) => api(`/productos/${id}`, { method: "DELETE" }),
};
