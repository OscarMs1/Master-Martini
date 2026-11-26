import { categorias } from "../data/editorial";

/*
 * Sugerencias del carrito (mismas reglas que la app móvil). Se calculan en el navegador con el
 * catálogo y las clases del backend, sin historial de otros clientes:
 * - Pesa más un producto que se usa junto a uno del carrito en alguna clase.
 * - Luego, productos de la misma línea (categoría), destacados y con descuento.
 * - Nunca se sugiere algo que ya está en el carrito o sin stock.
 */

export const nombreLinea = (id) => categorias.find((c) => c.id === id)?.nombre ?? id;

export function sugerirProductos(items, productos, clases = [], limite = 6) {
  const enCarrito = new Set(items.map((i) => i.id));
  const delCarrito = productos.filter((p) => enCarrito.has(p.id));
  const candidatos = productos.filter((p) => !enCarrito.has(p.id) && Number(p.stock) > 0 && !p.retirado);

  if (!delCarrito.length) {
    // Carrito vacío: destacados y ofertas.
    return candidatos
      .filter((p) => p.destacado || p.descuento > 0)
      .sort((a, b) => Number(b.destacado) - Number(a.destacado) || b.descuento - a.descuento)
      .slice(0, limite)
      .map((p) => ({ producto: p, motivo: p.descuento > 0 ? `Oferta: -${p.descuento} %` : "Destacado" }));
  }

  const lineas = new Set(delCarrito.map((p) => p.categoria));
  // Producto sugerido -> nombre del producto del carrito con el que comparte una clase.
  const usadoCon = new Map();
  for (const c of clases) {
    const ids = (c.productos ?? []).map((p) => p.id);
    const compartido = delCarrito.find((p) => ids.includes(p.id));
    if (!compartido) continue;
    ids.filter((id) => !enCarrito.has(id) && !usadoCon.has(id)).forEach((id) => usadoCon.set(id, compartido.nombre));
  }

  return candidatos
    .map((p) => {
      let puntaje = 0;
      if (usadoCon.has(p.id)) puntaje += 4;
      if (lineas.has(p.categoria)) puntaje += 2;
      if (p.destacado) puntaje += 1;
      if (p.descuento > 0) puntaje += 1;
      return { p, puntaje };
    })
    .filter((x) => x.puntaje >= 2)
    .sort((a, b) => b.puntaje - a.puntaje || a.p.nombre.localeCompare(b.p.nombre, "es"))
    .slice(0, limite)
    .map(({ p }) => ({
      producto: p,
      motivo: usadoCon.has(p.id)
        ? `Se usa junto a ${usadoCon.get(p.id)}`
        : lineas.has(p.categoria)
          ? `Más de ${nombreLinea(p.categoria)}`
          : "Destacado",
    }));
}

export function sugerirClases(items, productos, clases = [], inscritas = [], limite = 3, ahora = Date.now()) {
  if (!items.length) return [];
  const enCarrito = new Set(items.map((i) => i.id));
  const porId = new Map(productos.map((p) => [p.id, p]));
  const lineas = new Set(items.map((i) => porId.get(i.id)?.categoria).filter(Boolean));

  return clases
    .filter((c) => !inscritas.includes(c.id) && c.cuposDisponibles > 0 && new Date(c.fecha).getTime() > ahora)
    .map((c) => {
      const ids = (c.productos ?? []).map((p) => p.id);
      const directos = ids.filter((id) => enCarrito.has(id));
      const linea = ids.map((id) => porId.get(id)?.categoria).find((cat) => lineas.has(cat));
      if (directos.length) {
        const nombre = porId.get(directos[0])?.nombre ?? "un producto";
        return { clase: c, puntaje: 2 + directos.length, motivo: `Usa ${nombre} de tu carrito` };
      }
      if (linea) return { clase: c, puntaje: 1, motivo: `Ideal para tu línea de ${nombreLinea(linea)}` };
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, limite)
    .map(({ clase, motivo }) => ({ clase, motivo }));
}
