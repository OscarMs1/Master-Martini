import { afterEach, expect, it, vi } from "vitest";
import { api, resetCsrf } from "../services/api";
afterEach(() => { resetCsrf(); vi.unstubAllGlobals(); });
it("Comparte la obtención de CSRF en escrituras simultáneas sin repetirlas", async () => {
  resetCsrf();
  const fetchMock = vi.fn(async (url) => ({ ok: true, status: 200,
    json: async () => url.endsWith("/csrf") ? {headerName:"X-CSRF-TOKEN",token:"prueba"} : {id:1} }));
  vi.stubGlobal("fetch", fetchMock);
  await Promise.all([api("/contactos", {method:"POST",body:{}}),api("/contactos", {method:"POST",body:{}})]);
  expect(fetchMock.mock.calls.filter(([url]) => url.endsWith("/csrf"))).toHaveLength(1);
  const writes = fetchMock.mock.calls.filter(([url]) => url.endsWith("/contactos"));
  expect(writes).toHaveLength(2);
  expect(writes.every(([,options]) => options.headers["X-CSRF-TOKEN"] === "prueba")).toBe(true);
});
