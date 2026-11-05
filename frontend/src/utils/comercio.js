export const dinero = (value) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
export const precioFinal = (product) =>
  Math.round((product.precio * (100 - product.descuento)) / 100);
export function filtrarProductos(
  products,
  categoria = "",
  buscar = "",
  orden = "destacados",
) {
  const normalizar = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const result = products.filter(
    (p) =>
      (!categoria || p.categoria === categoria) &&
      normalizar(`${p.nombre} ${p.descripcion}`).includes(
        normalizar(buscar.trim()),
      ),
  );
  if (orden === "menor") result.sort((a, b) => precioFinal(a) - precioFinal(b));
  if (orden === "mayor") result.sort((a, b) => precioFinal(b) - precioFinal(a));
  if (orden === "nombre")
    result.sort((a, b) => a.nombre.localeCompare(b.nombre));
  if (orden === "destacados")
    result.sort((a, b) => Number(b.destacado) - Number(a.destacado));
  return result;
}
export function validarCantidad(cantidad, stock) {
  if (!Number.isInteger(cantidad) || cantidad < 1)
    throw new Error("La cantidad debe ser un entero mayor que cero.");
  if (cantidad > stock)
    throw new Error(`Solo hay ${stock} unidades disponibles.`);
}
export function agregarItem(items, producto, cantidad = 1) {
  const actual = items.find((i) => i.id === producto.id)?.cantidad || 0;
  validarCantidad(actual + cantidad, producto.stock);
  validarCantidad(cantidad, producto.stock);
  return [
    ...items.filter((i) => i.id !== producto.id),
    { id: producto.id, cantidad: actual + cantidad },
  ];
}
export function totales(items, productos, entrega = "domicilio") {
  let subtotal = 0,
    descuento = 0;
  items.forEach((item) => {
    const p = productos.find((p) => p.id === item.id);
    if (p) {
      subtotal += p.precio * item.cantidad;
      descuento += (p.precio - precioFinal(p)) * item.cantidad;
    }
  });
  const neto = subtotal - descuento;
  const despacho =
    entrega === "retiro" || neto >= 50000 || neto === 0 ? 0 : 3990;
  return { subtotal, descuento, despacho, total: neto + despacho };
}
