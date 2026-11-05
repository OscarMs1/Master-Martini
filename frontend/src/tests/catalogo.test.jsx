import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TarjetaProducto from "../components/productos/TarjetaProducto";
import Catalogo from "../pages/Catalogo";
import DetalleProducto from "../pages/DetalleProducto";
import { ShopContext } from "../context/ShopContext";

const productos = [
  {
    id: 1,
    nombre: "Margarina de hojaldre",
    precio: 6000,
    descuento: 10,
    stock: 10,
    categoria: "panaderia",
    formato: "1 kg",
    descripcion: "Para croissants",
    imagen: "/assets/images/croissants.jpg",
    destacado: true,
  },
  {
    id: 2,
    nombre: "Base para gelato",
    precio: 7000,
    descuento: 0,
    stock: 8,
    categoria: "gelateria",
    formato: "1 L",
    descripcion: "Helado artesanal",
    imagen: "/assets/images/helado.jpg",
    destacado: false,
  },
];
function catalogo() {
  return render(
    <MemoryRouter>
      <ShopContext.Provider
        value={{ productos, agregar: vi.fn(), loading: false, error: "" }}
      >
        <Catalogo />
      </ShopContext.Provider>
    </MemoryRouter>,
  );
}

describe("Catálogo y presentación", () => {
  it("1. Renderiza la fotografía referencial y el enlace al detalle", () => {
    render(
      <MemoryRouter>
        <TarjetaProducto producto={productos[0]} onAgregar={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/assets/images/croissants.jpg",
    );
    expect(
      screen.getByRole("link", { name: "Margarina de hojaldre" }),
    ).toHaveAttribute("href", "/producto/1");
    expect(screen.getByRole("img")).toHaveAttribute("alt", expect.stringContaining(productos[0].nombre));
  });
  it("2. Muestra el nombre y el precio con descuento, conservando el precio original", () => {
    render(
      <MemoryRouter>
        <TarjetaProducto producto={productos[0]} onAgregar={vi.fn()} />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Margarina de hojaldre" }),
    ).toBeInTheDocument();
    expect(screen.getByText("$5.400")).toBeInTheDocument();
    expect(screen.getByText("$6.000").tagName).toBe("DEL");
  });
  it("3. Confirma el producto agregado sobre la foto, sin aumentar la altura de la tarjeta", async () => {
    const onAgregar = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <TarjetaProducto producto={productos[0]} onAgregar={onAgregar} />
      </MemoryRouter>,
    );
    expect(container.querySelector(".product-media > .product-feedback")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Agregar Margarina de hojaldre/i }));
    expect(onAgregar).toHaveBeenCalledWith(productos[0]);
    expect(screen.getByRole("status")).toHaveTextContent("Margarina de hojaldre agregado al carrito.");
    expect(container.querySelectorAll(".product-feedback")).toHaveLength(1);
    expect(container.querySelector(".product-info .product-feedback")).toBeNull();
  });
  it("4. Permite consultar un producto agotado, avisa y no modifica el carrito", async () => {
    const agotado = { ...productos[1], stock: 0 };
    const onAgregar = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <TarjetaProducto producto={agotado} onAgregar={onAgregar} />
      </MemoryRouter>,
    );
    const boton = screen.getByRole("button", { name: /Sin stock: Base para gelato/i });
    expect(boton).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(boton);
    expect(screen.getByRole("alert")).toHaveTextContent("Sin stock. Este producto no se puede agregar al carrito.");
    expect(onAgregar).not.toHaveBeenCalled();
    expect(container.querySelector(".product-feedback")).toBeInTheDocument();
  });
  it("5. Muestra un error de stock al alcanzar el límite sin mostrar éxito", async () => {
    const onAgregar = vi.fn(() => { throw new Error("Solo hay 8 unidades disponibles."); });
    render(
      <MemoryRouter>
        <TarjetaProducto producto={productos[1]} onAgregar={onAgregar} />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button", { name: /Agregar Base para gelato/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("Solo hay 8 unidades disponibles.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
  it("4. Filtra el catálogo al cambiar la categoría", async () => {
    catalogo();
    await userEvent.selectOptions(
      screen.getByLabelText("Línea de productos"),
      "gelateria",
    );
    expect(
      screen.getByRole("heading", { name: "Base para gelato" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Margarina de hojaldre" }),
    ).not.toBeInTheDocument();
  });
  it("4. Busca productos por descripción y comunica cuando no hay coincidencias", async () => {
    catalogo();
    const input = screen.getByRole("textbox", { name: "Buscar productos" });
    await userEvent.type(input, "CROISSANTS");
    expect(
      screen.getByRole("heading", { name: "Margarina de hojaldre" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Base para gelato" }),
    ).not.toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, "inexistente");
    expect(screen.getByText("No encontramos productos")).toBeInTheDocument();
  });
  it("5. Muestra producto no encontrado para un ID inexistente", () => {
    render(
      <MemoryRouter initialEntries={["/producto/999"]}>
        <ShopContext.Provider value={{ productos, loading: false, error: "" }}>
          <Routes>
            <Route path="/producto/:id" element={<DetalleProducto />} />
          </Routes>
        </ShopContext.Provider>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Producto no encontrado" }),
    ).toBeInTheDocument();
  });
});
