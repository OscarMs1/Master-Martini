import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { agregarItem, totales } from "../utils/comercio";
import { correoValido } from "../utils/validaciones";
import { ShopProvider, useShop } from "../context/ShopContext";
import { productosApi } from "../services/productosApi";
import Contacto from "../pages/Contacto";
import CantidadEditable from "../components/CantidadEditable";
import FormularioProducto from "../components/admin/FormularioProducto";
import { api } from "../services/api";
vi.mock("../services/productosApi", () => ({
  productosApi: { listar: vi.fn() },
}));
vi.mock("../services/api", () => ({ api: vi.fn() }));
const producto = {
  id: 1,
  nombre: "Crema",
  precio: 10000,
  descuento: 15,
  stock: 3,
};
function CarritoPrueba() {
  const { agregar, items } = useShop();
  function agregarProducto() {
    try { agregar(producto); } catch { /* El ShopProvider muestra el único aviso. */ }
  }
  return (
    <>
      <button onClick={agregarProducto}>Agregar</button>
      <output aria-label="Unidades">
        {items.reduce((s, i) => s + i.cantidad, 0)}
      </output>
    </>
  );
}
function PruebaCantidad({ stock = 15, flechas = false }) {
  const [cantidad, setCantidad] = useState(1);
  const [valida, setValida] = useState(true);
  return (
    <>
      <CantidadEditable
        id="cantidad-prueba"
        label="Cantidad de prueba"
        valor={cantidad}
        stock={stock}
        flechas={flechas}
        onChange={setCantidad}
        onValidez={setValida}
      />
      <output aria-label="Cantidad confirmada">{cantidad}</output>
      <output aria-label="Cantidad válida">{String(valida)}</output>
    </>
  );
}
describe("Carrito y formularios", () => {
  it("6. Persiste el carrito y confirma las altas, sin mostrar éxito al superar el stock", async () => {
    productosApi.listar.mockResolvedValue([producto]);
    render(
      <ShopProvider>
        <CarritoPrueba />
      </ShopProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Agregar" }));
    expect(screen.getByLabelText("Unidades")).toHaveTextContent("1");
    expect(JSON.parse(localStorage.getItem("mm2-carrito"))).toEqual([
      { id: 1, cantidad: 1 },
    ]);
    expect(screen.getByText("Agregado al carrito")).toBeInTheDocument();
    expect(screen.getByText("Producto añadido correctamente.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Agregar" }));
    await userEvent.click(screen.getByRole("button", { name: "Agregar" }));
    expect(screen.getByLabelText("Unidades")).toHaveTextContent("3");
    expect(screen.getByText("Agregado al carrito")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Agregar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Límite de unidades");
    expect(screen.getByRole("alert")).toHaveTextContent("Solo quedan 3 disponibles.");
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveClass("shop-toast--limit");
    expect(screen.queryByText("Agregado al carrito")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("mm2-carrito"))).toEqual([
      { id: 1, cantidad: 3 },
    ]);
  });
  it("Muestra el estado agotado en el aviso inferior y permite cerrarlo", async () => {
    productosApi.listar.mockResolvedValue([producto]);
    function PruebaAgotado() {
      const { agregar } = useShop();
      return <button onClick={() => { try { agregar({ ...producto, stock: 0 }); } catch { /* aviso global */ } }}>Agotado</button>;
    }
    render(<ShopProvider><PruebaAgotado /></ShopProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Agotado" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Producto agotado");
    expect(screen.getByRole("alert")).toHaveTextContent("Sin stock por el momento.");
    await userEvent.click(screen.getByRole("button", { name: "Cerrar notificación" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("7. Rechaza una cantidad negativa sin modificar el carrito", () => {
    const items = [{ id: 1, cantidad: 1 }];
    expect(() => agregarItem(items, producto, -1)).toThrow("mayor que cero");
    expect(items).toEqual([{ id: 1, cantidad: 1 }]);
  });
  it("8. Impide superar stock al sumar nuevas unidades a una línea existente", () => {
    expect(() => agregarItem([{ id: 1, cantidad: 2 }], producto, 2)).toThrow(
      "3 unidades",
    );
  });
  it("9. Calcula subtotal, descuentos, despacho y total de la selección", () => {
    expect(totales([{ id: 1, cantidad: 2 }], [producto])).toEqual({
      subtotal: 20000,
      descuento: 3000,
      despacho: 3990,
      total: 20990,
    });
    expect(totales([{ id: 1, cantidad: 2 }], [producto], "retiro").total).toBe(
      17000,
    );
  });
  it("10. Rechaza un correo incorrecto y acepta uno con formato válido", () => {
    expect(correoValido("cliente@")).toBe(false);
    expect(correoValido("cliente@correo.cl")).toBe(true);
  });
  it("Permite borrar el número, escribir 15 y bloquea cantidades superiores al stock", async () => {
    const user = userEvent.setup();
    render(<PruebaCantidad />);
    const campo = screen.getByRole("spinbutton", { name: "Cantidad de prueba" });
    await user.clear(campo);
    expect(campo).toHaveValue(null);
    expect(screen.getByLabelText("Cantidad válida")).toHaveTextContent("false");
    await user.type(campo, "15");
    expect(campo).toHaveValue(15);
    expect(screen.getByLabelText("Cantidad confirmada")).toHaveTextContent("15");
    await user.clear(campo);
    await user.type(campo, "16");
    expect(screen.getByRole("alert")).toHaveTextContent("Máximo disponible: 15 unidades.");
    expect(screen.getByLabelText("Cantidad confirmada")).toHaveTextContent("1");
    expect(screen.getByLabelText("Cantidad válida")).toHaveTextContent("false");
  });
  it("Las flechas respetan el stock y un producto agotado no presenta un error duplicado", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<PruebaCantidad stock={2} flechas />);
    expect(screen.getByRole("button", { name: "Disminuir cantidad" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    expect(screen.getByRole("spinbutton")).toHaveValue(2);
    expect(screen.getByRole("button", { name: "Aumentar cantidad" })).toBeDisabled();
    rerender(<PruebaCantidad stock={0} flechas />);
    expect(screen.getByRole("spinbutton")).toBeDisabled();
    expect(screen.getByRole("alert")).toBeEmptyDOMElement();
    expect(screen.getByLabelText("Cantidad válida")).toHaveTextContent("false");
  });
  it("Permite vaciar y reescribir los campos numéricos del administrador", async () => {
    const user = userEvent.setup();
    render(<FormularioProducto guardar={vi.fn()} cancelar={vi.fn()} busy={false} />);
    const stock = screen.getByRole("spinbutton", { name: "Stock" });
    await user.clear(stock);
    expect(stock).toHaveValue(null);
    await user.type(stock, "15");
    expect(stock).toHaveValue(15);
  });
  it("11. Valida contacto en el DOM y no envía una solicitud incompleta", async () => {
    api.mockClear();
    render(
      <MemoryRouter>
        <Contacto />
      </MemoryRouter>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Guardar mensaje →" }),
    );
    expect(screen.getByLabelText("Correo electrónico")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(
      screen.getByText("Escribe al menos 10 caracteres."),
    ).toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
  });
});
