import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Header from "../components/layout/Header";

vi.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("../context/ShopContext", () => ({ useShop: () => ({ items: [] }) }));

afterEach(() => {
  cleanup();
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
});

function renderHeader(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="*" element={<Header />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Navbar y scroll", () => {
  it("mantiene la navbar de Inicio y cambia de transparencia sin animarse desde arriba", () => {
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    const { container } = renderHeader("/");
    expect(container.querySelector("header")).toHaveClass("header-transparent");
    Object.defineProperty(window, "scrollY", { value: 100, configurable: true });
    fireEvent.scroll(window);
    expect(container.querySelector("header")).toHaveClass("header-scrolled");
    expect(container.querySelector("header")).not.toHaveClass("header-transparent");
  });
  it("aplica el mismo estado de scroll en páginas interiores", () => {
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    const { container } = renderHeader("/catalogo");
    expect(container.querySelector("header")).toHaveClass("header-internal");
    Object.defineProperty(window, "scrollY", { value: 100, configurable: true });
    fireEvent.scroll(window);
    expect(container.querySelector("header")).toHaveClass("header-scrolled");
  });
});
