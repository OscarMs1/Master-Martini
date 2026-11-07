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
  it("3. Usa exclusivamente el aviso global al añadir un producto", async () => {
    const onAgregar = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <TarjetaProducto producto={productos[0]} onAgregar={onAgregar} />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button", { name: /Agregar Margarina de hojaldre/i }));
    expect(onAgregar).toHaveBeenCalledWith(productos[0]);
    expect(container.querySelector(".product-feedback")).toBeNull();
    expect(screen.queryByText("Agregado al carrito.")).not.toBeInTheDocument();
  });
  it("4. Permite consultar el estado agotado sin añadir mensajes bajo la tarjeta", async () => {
    const agotado = { ...productos[1], stock: 0 };
    const onAgregar = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <TarjetaProducto producto={agotado} onAgregar={onAgregar} />
      </MemoryRouter>,
    );
    const boton = screen.getByRole("button", { name: /Sin stock: Base para gelato/i });
    await userEvent.click(boton);
    expect(onAgregar).toHaveBeenCalledWith(agotado);
    expect(container.querySelector(".product-feedback")).toBeNull();
  });
  it("5. No duplica errores dentro de la tarjeta", async () => {
    const onAgregar = vi.fn(() => { throw new Error("Solo hay 8 unidades disponibles."); });
    const { container } = render(
      <MemoryRouter>
        <TarjetaProducto producto={productos[1]} onAgregar={onAgregar} />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button", { name: /Agregar Base para gelato/i }));
    expect(onAgregar).toHaveBeenCalledOnce();
    expect(container.querySelector(".product-feedback")).toBeNull();
  });
  it("6. Muestra error justo bajo el botón en la ficha cuando no hay stock", async () => {
    const agotado = { ...productos[1], stock: 0 };
    const agregar = vi.fn();
    render(
      <MemoryRouter initialEntries={["/producto/2"]}>
        <ShopContext.Provider value={{ productos: [agotado], loading: false, error: "", agregar }}>
          <Routes><Route path="/producto/:id" element={<DetalleProducto />} /></Routes>
        </ShopContext.Provider>
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button", { name: /Agregar al carrito/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("No hay unidades disponibles para añadir.");
    expect(agregar).not.toHaveBeenCalled();
  });
  it("7. En la ficha avisa si la cantidad supera el stock", async () => {
    const agregar = vi.fn();
    render(
      <MemoryRouter initialEntries={["/producto/2"]}>
        <ShopContext.Provider value={{ productos, loading: false, error: "", agregar }}>
          <Routes><Route path="/producto/:id" element={<DetalleProducto />} /></Routes>
        </ShopContext.Provider>
      </MemoryRouter>,
    );
    const campo = screen.getByRole("spinbutton", { name: "Cantidad de Base para gelato" });
    await userEvent.clear(campo);
    await userEvent.type(campo, "99");
    await userEvent.click(screen.getByRole("button", { name: /Agregar al carrito/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("Máximo disponible: 8 unidades.");
    expect(agregar).not.toHaveBeenCalled();
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
