import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: { id: 7, nombre: "Ana" } }) }));
vi.mock("../services/api", () => ({
  api: vi.fn(async (ruta) => {
    if (ruta === "/favoritos") return [];
    return {
      promedio: 5, cantidad: 2,
      opiniones: [
        { id: 1, autor: "Ana P.", puntuacion: 5, comentario: "<p>Rinde <strong>muy bien</strong></p><ul><li>Fácil de batir</li></ul><script>alert(1)</script>", mia: true },
        { id: 2, autor: "Luis R.", puntuacion: 4, comentario: "Opinión antigua en texto plano", mia: false },
      ],
    };
  }),
}));

import ProductoExtras from "../components/ProductoExtras";

describe("reseñas con editor enriquecido", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra el formato de la opinión, limpia scripts y acepta texto plano antiguo", async () => {
    const { container } = render(<MemoryRouter><ProductoExtras producto={{ id: 3 }} /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("muy bien")).toBeInTheDocument());
    expect(screen.getByText("muy bien").tagName).toBe("STRONG");
    expect(screen.getByText("Fácil de batir").tagName).toBe("LI");
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("Opinión antigua en texto plano")).toBeInTheDocument();
  });

  it("usa el editor TipTap sin botón de enlace para escribir la opinión", async () => {
    render(<MemoryRouter><ProductoExtras producto={{ id: 3 }} /></MemoryRouter>);
    await waitFor(() => expect(screen.getByRole("toolbar", { name: "Formato del texto" })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Negrita" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enlace" })).toBeNull();
    expect(screen.getByRole("button", { name: "Publicar opinión" })).toBeDisabled();
  });
});
