import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, beforeEach, test, expect } from "vitest";

vi.mock("../services/api", () => ({ api: vi.fn() }));
import { api } from "../services/api";
import ChatAyuda from "../components/ChatAyuda";

beforeEach(() => {
  sessionStorage.clear();
  api.mockReset();
});

function abrir() {
  render(<MemoryRouter><ChatAyuda /></MemoryRouter>);
  fireEvent.click(screen.getByRole("button", { name: "Abrir asistente de ayuda" }));
}

test("envía la conversación y muestra la respuesta con enlaces internos", async () => {
  api.mockResolvedValue({ respuesta: "Tenemos estas ofertas:\n- Chocolate 70% en /producto/3\nMira todas en /ofertas." });
  abrir();
  fireEvent.change(screen.getByLabelText("Escribe tu pregunta"), { target: { value: "¿Qué ofertas hay?" } });
  fireEvent.click(screen.getByRole("button", { name: "Enviar pregunta" }));

  expect(await screen.findByRole("link", { name: "/ofertas" })).toHaveAttribute("href", "/ofertas");
  expect(screen.getByRole("link", { name: "/producto/3" })).toHaveAttribute("href", "/producto/3");
  const [ruta, opciones] = api.mock.calls[0];
  expect(ruta).toBe("/asistente");
  expect(opciones.body.mensajes.at(-1)).toEqual({ rol: "user", texto: "¿Qué ofertas hay?" });
});

test("si el asistente no está disponible devuelve la pregunta al campo", async () => {
  api.mockRejectedValue(Object.assign(new Error("x"), { status: 503 }));
  abrir();
  fireEvent.click(screen.getByRole("button", { name: "¿Cómo hago un pedido?" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("no está disponible");
  await waitFor(() => expect(screen.getByLabelText("Escribe tu pregunta")).toHaveValue("¿Cómo hago un pedido?"));
});
