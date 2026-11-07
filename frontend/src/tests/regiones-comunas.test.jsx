import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import DatosEntrega, { entregaVacia } from "../components/DatosEntrega";
import {
  REGIONES_COMUNAS_CHILE,
  comunasDeRegion,
  esUbicacionValida,
  regionesChile,
  regionCanonica,
} from "../data/regionesComunasChile";
import { validarEntrega } from "../utils/validaciones";

function EjemploFormulario() {
  const [data, setData] = useState(entregaVacia);
  return (
    <DatosEntrega
      data={data}
      errors={{}}
      onChange={(e) => {
        const { name, value } = e.target;
        setData((prev) => ({
          ...prev,
          [name]: value,
          ...(name === "region" ? { comuna: "" } : {}),
        }));
      }}
    />
  );
}

describe("regiones y comunas de Chile", () => {
  it("contiene 8 regiones y 173 comunas seleccionadas sin duplicados", () => {
    expect(regionesChile).toHaveLength(8);
    expect(REGIONES_COMUNAS_CHILE.reduce((total, item) => total + item.comunas.length, 0)).toBe(173);
    expect(new Set(regionesChile).size).toBe(8);
    REGIONES_COMUNAS_CHILE.forEach(({ comunas }) => {
      expect(new Set(comunas).size).toBe(comunas.length);
    });
  });

  it("incluye comunas de distintas zonas y evita asociaciones incorrectas", () => {
    expect(comunasDeRegion("Región Metropolitana de Santiago")).toHaveLength(38);
    expect(esUbicacionValida("Región Metropolitana de Santiago", "Renca")).toBe(true);
    expect(esUbicacionValida("Región de Los Lagos", "Puerto Montt")).toBe(true);
    expect(esUbicacionValida("Región de Los Lagos", "Castro")).toBe(true);
    expect(esUbicacionValida("Región Metropolitana de Santiago", "Valparaíso")).toBe(false);
    expect(comunasDeRegion("Región que no existe")).toEqual([]);
    expect(regionCanonica("RM")).toBe("Región Metropolitana de Santiago");
    expect(regionCanonica("Metropolitana")).toBe("Región Metropolitana de Santiago");
    expect(regionCanonica("Región de Valparaíso")).toBe("Región de Valparaíso");
  });

  it("usa dos desplegables dependientes y limpia la comuna al cambiar de región", () => {
    render(<EjemploFormulario />);
    const region = screen.getByLabelText("Región");
    const comuna = screen.getByLabelText("Comuna");
    expect(region.tagName).toBe("SELECT");
    expect(comuna.tagName).toBe("SELECT");
    expect(region.options).toHaveLength(9); // 8 regiones + indicación inicial
    expect(comuna).toBeDisabled();

    fireEvent.change(region, { target: { value: "Región Metropolitana de Santiago" } });
    expect(comuna).not.toBeDisabled();
    expect(comuna.options).toHaveLength(39); // 38 comunas + indicación inicial
    fireEvent.change(comuna, { target: { value: "Renca" } });
    expect(comuna.value).toBe("Renca");

    fireEvent.change(region, { target: { value: "Región de Valparaíso" } });
    expect(comuna.value).toBe("");
    expect(comuna.options).toHaveLength(26); // 25 comunas + indicación inicial
    expect(Array.from(comuna.options).some((option) => option.value === "Renca")).toBe(false);
  });

  it("valida que la región exista y la comuna pertenezca a ella", () => {
    const datos = {
      nombre: "Persona de prueba",
      email: "persona@ejemplo.com",
      run: "11.111.111-1",
      telefono: "+56 9 1234 5678",
      region: "Región Metropolitana de Santiago",
      comuna: "Renca",
      direccion: "Calle de prueba 123",
    };
    expect(validarEntrega(datos).region).toBeUndefined();
    expect(validarEntrega(datos).comuna).toBeUndefined();
    expect(validarEntrega({ ...datos, comuna: "Valparaíso" }).comuna).toMatch(/región/);
    expect(validarEntrega({ ...datos, region: "RM" }).region).toBeDefined();
    expect(validarEntrega({ ...datos, comuna: "" }).comuna).toBeDefined();
  });
});
