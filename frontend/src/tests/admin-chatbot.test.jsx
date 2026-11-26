import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const respuesta = {
  total: 12,
  hoy: 3,
  retencionDias: 90,
  porDia: [
    { fecha: "2026-11-25", total: 4 },
    { fecha: "2026-11-26", total: 8 },
  ],
  masFrecuentes: [
    { pregunta: "¿Qué ofertas hay?", veces: 5 },
    { pregunta: "<b>cuando son las clases</b>", veces: 2 },
  ],
  recientes: [
    { texto: "¿Qué ofertas hay?", fecha: "2026-11-26T15:00:00Z", respondida: true },
    { texto: "hola", fecha: "2026-11-26T14:00:00Z", respondida: false },
  ],
};
const api = vi.fn();
vi.mock("../services/api", () => ({ api: (...args) => api(...args) }));

import AdminChatbot from "../components/admin/AdminChatbot";

describe("pestaña Chatbot del administrador", () => {
  beforeEach(() => api.mockReset());

  it("muestra totales, preguntas frecuentes y últimas consultas", async () => {
    api.mockResolvedValue(respuesta);
    render(<AdminChatbot />);
    expect(await screen.findByText("Lo que más preguntan")).toBeInTheDocument();
    expect(api).toHaveBeenCalledWith("/admin/asistente/consultas");
    expect(screen.getByText("Preguntas guardadas").previousSibling).toHaveTextContent("12");
    expect(screen.getAllByText("¿Qué ofertas hay?")).toHaveLength(2);
    expect(screen.getByText("Respondida")).toBeInTheDocument();
    expect(screen.getByText("No se pudo responder")).toBeInTheDocument();
    expect(screen.getByText(/se borran solas a los 90 días/i)).toBeInTheDocument();
  });

  it("muestra el texto de las preguntas como texto, sin interpretarlo como HTML", async () => {
    api.mockResolvedValue(respuesta);
    const { container } = render(<AdminChatbot />);
    await screen.findByText("<b>cuando son las clases</b>");
    expect(container.querySelector("b")).toBeNull();
  });

  it("avisa cuando todavía no hay preguntas", async () => {
    api.mockResolvedValue({ ...respuesta, total: 0, masFrecuentes: [], recientes: [] });
    render(<AdminChatbot />);
    expect(await screen.findByText(/todavía nadie ha usado el chatbot/i)).toBeInTheDocument();
  });

  it("muestra el error y permite reintentar", async () => {
    api.mockRejectedValueOnce(new Error("Sin permiso")).mockResolvedValueOnce(respuesta);
    render(<AdminChatbot />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Sin permiso");
    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(screen.getByText("Lo que más preguntan")).toBeInTheDocument());
  });
});
