import { describe, it, expect } from "vitest";
import { aHtml, limpiarHtml, esVacio, dividirContenido } from "../utils/contenidoEnriquecido";

describe("Contenido enriquecido de novedades", () => {
  it("convierte el texto plano antiguo en párrafos HTML", () => {
    expect(aHtml("Uno\n\nDos & tres")).toBe("<p>Uno</p><p>Dos &amp; tres</p>");
  });

  it("elimina scripts, manejadores de eventos y enlaces javascript:", () => {
    const sucio =
      '<p onclick="x()">Hola<script>alert(1)</script></p><a href="javascript:alert(1)">mal</a><img src=x onerror=alert(1)>';
    const limpio = limpiarHtml(sucio);
    expect(limpio).not.toMatch(/script|onclick|onerror|javascript:|<img/i);
    expect(limpio).toContain("Hola");
  });

  it("conserva el formato permitido y protege los enlaces externos", () => {
    const limpio = limpiarHtml(
      '<h2>Título</h2><p><strong>Negrita</strong> <a href="https://ejemplo.cl">enlace</a></p><ul><li>a</li></ul>',
    );
    expect(limpio).toContain("<h2>Título</h2>");
    expect(limpio).toContain("<strong>Negrita</strong>");
    expect(limpio).toContain('rel="noopener noreferrer"');
    expect(limpio).toContain('target="_blank"');
    expect(limpio).toContain("<ul><li>a</li></ul>");
  });

  it("detecta un editor vacío", () => {
    expect(esVacio("<p></p>")).toBe(true);
    expect(esVacio("<p>hola</p>")).toBe(false);
  });

  it("separa la introducción del cuerpo", () => {
    const { intro, cuerpoHtml } = dividirContenido("<p>Intro</p><h2>Tema</h2><p>Texto</p>", "bajada");
    expect(intro).toBe("Intro");
    expect(cuerpoHtml).toBe("<h2>Tema</h2><p>Texto</p>");
  });

  it("usa la introducción como cuerpo si solo hay un párrafo", () => {
    const { intro, cuerpoHtml } = dividirContenido("Solo un párrafo", "bajada");
    expect(intro).toBe("Solo un párrafo");
    expect(cuerpoHtml).toBe("<p>Solo un párrafo</p>");
  });
});
