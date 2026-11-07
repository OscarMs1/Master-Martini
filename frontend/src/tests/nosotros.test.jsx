import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Nosotros from "../pages/Nosotros";

describe("Página Nosotros", () => {
  it("presenta la introducción editorial y las dos historias visuales", () => {
    render(<MemoryRouter><Nosotros /></MemoryRouter>);
    expect(screen.getByRole("heading", { level: 1, name: "Lo que hacemos" })).toBeInTheDocument();
    const estrella = document.querySelector(".nosotros-presentacion__estrella");
    expect(estrella).not.toBeNull();
    expect(estrella.querySelector("path")).toHaveAttribute("stroke", "#052B67");
    expect(estrella.querySelector('circle[fill="#F7D3A5"]')).not.toBeNull();
    expect(screen.queryByText(/Proyecto académico no oficial/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Información de referencia/i)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /El oficio detrás de cada creación/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Raíces italianas/i })).toBeInTheDocument();
    expect(screen.getByAltText(/Profesional de panadería/i)).toHaveAttribute("src", "/assets/images/nosotros-oficio.jpg");
    expect(screen.getByAltText(/Manos trabajando una masa/i)).toHaveAttribute("src", "/assets/images/inicio-laminado.jpg");
  });

  it("conserva los accesos a productos, novedades y las cuatro líneas", () => {
    render(<MemoryRouter><Nosotros /></MemoryRouter>);
    expect(screen.getByRole("link", { name: /Explorar nuestros productos/i })).toHaveAttribute("href", "/catalogo");
    expect(screen.getByRole("link", { name: /Conocer nuestras ideas/i })).toHaveAttribute("href", "/novedades");
    const rutas = ["panaderia", "gelateria", "food-service", "retail"];
    for (const categoria of rutas) {
      expect(document.querySelector(`a[href="/catalogo?categoria=${categoria}"]`)).toBeTruthy();
    }
  });
});
