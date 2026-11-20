import { afterEach, expect, it, vi } from "vitest";
import { api, setAccessToken } from "../services/api";
import { authApi } from "../services/authApi";

const respuesta = (status, body) => ({ ok: status < 400, status, json: async () => body });
afterEach(() => { setAccessToken(null); vi.unstubAllGlobals(); });

it("Envía el token en memoria y nunca lo guarda en el navegador", async () => {
  const fetchMock = vi.fn(async (url) =>
    url.endsWith("/auth/login") ? respuesta(200, { accessToken: "t1", usuario: { id: 1 } }) : respuesta(200, { id: 1 }));
  vi.stubGlobal("fetch", fetchMock);
  expect(await authApi.login({ email: "a@test.cl", password: "x" })).toEqual({ id: 1 });
  await api("/pedidos/mis-pedidos");
  expect(fetchMock.mock.calls.at(-1)[1].headers.Authorization).toBe("Bearer t1");
  expect(JSON.stringify({ ...localStorage })).not.toContain("t1");
  expect(JSON.stringify({ ...sessionStorage })).not.toContain("t1");
});

it("Con el token vencido renueva una sola vez para peticiones simultáneas y las repite", async () => {
  setAccessToken("viejo");
  const fetchMock = vi.fn(async (url, options) => {
    if (url.endsWith("/auth/refresh")) return respuesta(200, { accessToken: "nuevo", usuario: { id: 1 } });
    return options.headers?.Authorization === "Bearer nuevo" ? respuesta(200, { id: 1 }) : respuesta(401, {});
  });
  vi.stubGlobal("fetch", fetchMock);
  await Promise.all([api("/favoritos"), api("/pedidos/mis-pedidos")]);
  expect(fetchMock.mock.calls.filter(([url]) => url.endsWith("/auth/refresh"))).toHaveLength(1);
  expect(fetchMock.mock.calls.filter(([, o]) => o.headers?.Authorization === "Bearer nuevo")).toHaveLength(2);
});

it("Si la renovación falla avisa que la sesión expiró", async () => {
  setAccessToken("viejo");
  vi.stubGlobal("fetch", vi.fn(async () => respuesta(401, { message: "Inicia sesión para continuar." })));
  const expirada = vi.fn();
  window.addEventListener("session-expired", expirada);
  await expect(api("/favoritos")).rejects.toMatchObject({ status: 401 });
  expect(expirada).toHaveBeenCalled();
  window.removeEventListener("session-expired", expirada);
});
