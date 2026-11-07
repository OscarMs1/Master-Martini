import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetalleNovedad from "../pages/DetalleNovedad";
import Novedades from "../pages/Novedades";
import { imagenParaNovedad, imagenesNovedades } from "../data/imagenesNovedades";

const articulos = [
  { slug: "el-arte-del-laminado", titulo: "El arte de las mil capas.", bajada: "Temperatura y precisión.", contenido: "Masa y mantequilla.\n\nDescanso entre vueltas.\n\nHorneado.", fecha: "2026-10-30", imagen: "/assets/images/vieja-laminado.jpg" },
  { slug: "texturas-de-chocolate", titulo: "Chocolate. Un mundo de texturas.", bajada: "Muchas maneras de terminar.", contenido: "Brillo y textura.\n\nRevisa la ficha técnica.\n\nCompara terminaciones.", fecha: "2026-10-30", imagen: "/assets/images/vieja-chocolate.jpg" },
  { slug: "un-gelato-con-identidad", titulo: "Un gelato con identidad.", bajada: "El sabor como punto de partida.", contenido: "El equilibrio importa.\n\nRespeta las proporciones.\n\nHaz pruebas pequeñas.", fecha: "2026-10-30", imagen: "/assets/images/vieja-gelato.jpg" },
];

vi.mock("../services/useNovedades", () => ({
  default: () => ({ articulos, loading: false, error: "" }),
}));

const esperadas = [
  ["el-arte-del-laminado", "novedad-laminado.jpg"],
  ["texturas-de-chocolate", "novedad-chocolate.jpg"],
  ["un-gelato-con-identidad", "novedad-gelato.jpg"],
];

describe("Imágenes consistentes en Novedades", () => {
  it.each(esperadas)("%s muestra la misma foto en detalle y otras novedades", (slug, archivo) => {
    const { container } = render(
      <MemoryRouter initialEntries={[`/novedades/${slug}`]}>
        <Routes><Route path="/novedades/:slug" element={<DetalleNovedad />} /></Routes>
      </MemoryRouter>,
    );
    const articulo = articulos.find((item) => item.slug === slug);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(articulo.titulo.replace(/\.$/, ""));
    expect(container.querySelector(".novedad-editorial__marco img")).toHaveAttribute("src", `/assets/images/${archivo}`);
    expect(screen.getByRole("link", { name: /Volver a novedades/i })).toHaveAttribute("href", "/novedades");
    expect(screen.getByRole("link", { name: /Seguir aprendiendo/i })).toHaveAttribute("href", "/clases");
    const otras = container.querySelectorAll(".novedad-editorial__otra");
    expect(otras).toHaveLength(2);
    for (const tarjeta of otras) {
      const slugRelacionada = tarjeta.getAttribute("href").split("/").pop();
      expect(tarjeta.querySelector("img")).toHaveAttribute("src", imagenesNovedades[slugRelacionada].src);
    }
    expect(container.querySelector(".novedad-editorial__credito")).toBeNull();
    expect(container.textContent).not.toMatch(/Fotografía de|Unsplash/);
  });

  it("usa las imágenes nuevas en las tres tarjetas del listado", () => {
    const { container } = render(
      <MemoryRouter><Novedades /></MemoryRouter>,
    );
    const tarjetas = container.querySelectorAll(".novedad-card");
    expect(tarjetas).toHaveLength(3);
    for (const tarjeta of tarjetas) {
      const slug = tarjeta.getAttribute("href").split("/").pop();
      expect(tarjeta.querySelector("img")).toHaveAttribute("src", imagenesNovedades[slug].src);
    }
  });

  it("mantiene la imagen de la API para artículos nuevos sin mapeo", () => {
    expect(imagenParaNovedad({slug:"otra-novedad",imagen:"/assets/images/otra.jpg"})).toBe("/assets/images/otra.jpg");
    const subida = "/api/imagenes/12345678-1234-1234-1234-123456789012.png";
    expect(imagenParaNovedad({slug:"el-arte-del-laminado",imagen:subida})).toBe(subida);
  });
});
