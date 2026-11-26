import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { sugerirClases, sugerirProductos } from "../utils/recomendaciones";

const productos = [
  { id: 1, nombre: "Margarina para hojaldre", categoria: "panaderia", stock: 10, precio: 5990, descuento: 10, destacado: true },
  { id: 2, nombre: "Crema para batir", categoria: "panaderia", stock: 5, precio: 4590, descuento: 0, destacado: false },
  { id: 3, nombre: "Cobertura de chocolate", categoria: "panaderia", stock: 0, precio: 7690, descuento: 20, destacado: true },
  { id: 4, nombre: "Base para gelato", categoria: "gelateria", stock: 8, precio: 8990, descuento: 0, destacado: false },
  { id: 6, nombre: "Pasta sabor pistacho", categoria: "gelateria", stock: 8, precio: 9990, descuento: 0, destacado: false },
];
const futuro = "2099-01-01T12:00:00Z";
const clases = [
  { id: 1, titulo: "El arte del croissant", fecha: futuro, cuposDisponibles: 12, modalidad: "Presencial", productos: [{ id: 1 }] },
  { id: 2, titulo: "Gelato: textura y sabor", fecha: futuro, cuposDisponibles: 5, modalidad: "Presencial", productos: [{ id: 4 }, { id: 6 }] },
  { id: 3, titulo: "Clase pasada", fecha: "2000-01-01T12:00:00Z", cuposDisponibles: 5, modalidad: "Online", productos: [{ id: 4 }] },
];

vi.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("../services/api", () => ({ api: vi.fn(async (ruta) => (ruta === "/clases" ? clases : [])) }));
vi.mock("../context/ShopContext", () => ({
  useShop: () => ({ items: [{ id: 4, cantidad: 1 }], productos, agregar: vi.fn() }),
}));
import SugerenciasCarrito from "../components/SugerenciasCarrito";

describe("sugerencias del carrito", () => {
  it("prioriza lo que se usa en la misma clase y omite lo agotado o ya agregado", () => {
    const s = sugerirProductos([{ id: 4, cantidad: 1 }], productos, clases);
    expect(s[0]).toEqual({ producto: productos[4], motivo: "Se usa junto a Base para gelato" });
    expect(s.map((x) => x.producto.id)).not.toContain(4);
    expect(s.map((x) => x.producto.id)).not.toContain(3);
  });

  it("con el carrito vacío sugiere destacados y ofertas con stock", () => {
    const s = sugerirProductos([], productos, clases);
    expect(s.map((x) => x.producto.id)).toEqual([1]);
    expect(s[0].motivo).toBe("Oferta: -10 %");
  });

  it("sugiere clases futuras con cupos, sin las inscritas", () => {
    const items = [{ id: 1, cantidad: 1 }, { id: 4, cantidad: 1 }];
    expect(sugerirClases(items, productos, clases).map((x) => x.clase.id)).toEqual([1, 2]);
    expect(sugerirClases(items, productos, clases, [2]).map((x) => x.clase.id)).toEqual([1]);
    expect(sugerirClases([{ id: 2, cantidad: 1 }], productos, clases)[0].motivo).toBe("Ideal para tu línea de Panadería & Pastelería");
  });

  it("muestra productos y clases sugeridos en el carrito", async () => {
    render(<MemoryRouter><SugerenciasCarrito /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText("Gelato: textura y sabor")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Agregar Pasta sabor pistacho al carrito" })).toBeInTheDocument();
    expect(screen.getByText("Usa Base para gelato de tu carrito")).toBeInTheDocument();
    expect(screen.queryByText("Clase pasada")).toBeNull();
  });
});
