import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DetalleNovedad from "../pages/DetalleNovedad";
import Novedades from "../pages/Novedades";
import { imagenParaNovedad, imagenesNovedades } from "../data/imagenesNovedades";
import { collageParaNovedad } from "../data/collagesNovedades";

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

describe("Novedades con collage editorial optimizado", () => {
  it.each(esperadas)("%s muestra tres fotos reales sin créditos visibles", (slug) => {
    const { container } = render(
      <MemoryRouter initialEntries={[`/novedades/${slug}`]}>
        <Routes><Route path="/novedades/:slug" element={<DetalleNovedad />} /></Routes>
      </MemoryRouter>,
    );
    const articulo = articulos.find((item) => item.slug === slug);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(articulo.titulo.replace(/\.$/, ""));
    const imgs = container.querySelectorAll(".novedad-editorial__collage-photo img");
    const collage = collageParaNovedad(articulo);
    expect(imgs).toHaveLength(3);
    imgs.forEach((img, i) => {
      expect(img).toHaveAttribute("src", collage[i].src);
      expect(img.getAttribute("srcset")).toContain("360w");
      expect(img).toHaveAttribute("loading", "eager");
      expect(img.getAttribute("src")).toMatch(/^https:\/\/images\.unsplash\.com\//);
    });
    expect(imgs[0]).toHaveAttribute("fetchpriority", "high");
    expect(container.querySelector(".novedad-editorial__collage-credits")).toBeNull();
    expect(container.textContent).not.toMatch(/Fotografías:|Unsplash/);
    expect(container.querySelector(".novedad-editorial__forma")).toBeNull();
    expect(screen.getByRole("link", { name: /Volver a novedades/i })).toHaveAttribute("href", "/novedades");
    expect(screen.getByRole("link", { name: /Seguir aprendiendo/i })).toHaveAttribute("href", "/clases");
    const otras = container.querySelectorAll(".novedad-editorial__otra");
    expect(otras).toHaveLength(2);
    for (const tarjeta of otras) {
      const slugRelacionada = tarjeta.getAttribute("href").split("/").pop();
      expect(tarjeta.querySelector("img")).toHaveAttribute("src", imagenesNovedades[slugRelacionada].src);
    }
  });

  it("mantiene las imágenes originales en las tarjetas del listado", () => {
    const { container } = render(<MemoryRouter><Novedades /></MemoryRouter>);
    const tarjetas = container.querySelectorAll(".novedad-card");
    expect(tarjetas).toHaveLength(3);
    for (const tarjeta of tarjetas) {
      const slug = tarjeta.getAttribute("href").split("/").pop();
      expect(tarjeta.querySelector("img")).toHaveAttribute("src", imagenesNovedades[slug].src);
    }
  });

  it("no modifica la imagen de API para artículos nuevos", () => {
    expect(imagenParaNovedad({ slug: "otra-novedad", imagen: "/assets/images/otra.jpg" })).toBe("/assets/images/otra.jpg");
    const subida = "/api/imagenes/12345678-1234-1234-1234-123456789012.png";
    expect(imagenParaNovedad({ slug: "el-arte-del-laminado", imagen: subida })).toBe(subida);
    expect(collageParaNovedad({ slug: "otra-novedad", imagen: subida })).toHaveLength(1);
  });
});
