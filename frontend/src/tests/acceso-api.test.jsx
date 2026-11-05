import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ShopProvider } from "../context/ShopContext";
import RutaProtegida from "../components/RutaProtegida";
import Catalogo from "../pages/Catalogo";
import Clases from "../pages/Clases";
afterEach(() => vi.unstubAllGlobals());
describe("Permisos y fallos de comunicación", () => {
  it("12. Redirige a login al intentar inscribirse sin sesión y no crea una inscripción", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 1,
            titulo: "Laminado",
            descripcion: "Clase demo",
            fecha: "2026-12-20T13:00:00Z",
            modalidad: "Online",
            cuposDisponibles: 4,
            productos: [],
          },
        ],
      });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter initialEntries={["/clases"]}>
        <AuthContext.Provider value={{ user: null, loading: false }}>
          <Routes>
            <Route path="/clases" element={<Clases />} />
            <Route path="/login" element={<h1>Iniciar sesión</h1>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Inscribirme →" }),
    );
    expect(
      screen.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.every(([url]) => !url.includes("/inscripciones")),
    ).toBe(true);
  });
  it("13. Bloquea una ruta administrativa para un cliente autenticado", () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider
          value={{ user: { rol: "CLIENTE" }, loading: false }}
        >
          <RutaProtegida admin>
            <h1>Panel de productos</h1>
          </RutaProtegida>
        </AuthContext.Provider>
      </MemoryRouter>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Acceso restringido");
    expect(
      screen.queryByRole("heading", { name: "Panel de productos" }),
    ).not.toBeInTheDocument();
  });
  it("14. Muestra un error accesible si la petición real del servicio de catálogo falla", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    render(
      <MemoryRouter>
        <ShopProvider>
          <Catalogo />
        </ShopProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No podemos conectar con el servidor",
    );
    expect(
      screen.getByRole("button", { name: "Volver a intentar" }),
    ).toBeInTheDocument();
  });
});
