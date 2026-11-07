import { comunasDeRegion, esUbicacionValida } from "../data/regionesComunasChile";

export const correoValido = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
export function runValido(value = "") {
  const clean = value.replace(/[.\s-]/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false;
  let sum = 0,
    factor = 2;
  for (const digit of clean.slice(0, -1).split("").reverse()) {
    sum += Number(digit) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const dv = 11 - (sum % 11);
  return clean.at(-1) === (dv === 11 ? "0" : dv === 10 ? "K" : String(dv));
}
export function validarContacto(data) {
  const errors = {};
  if ((data.nombre || "").trim().length < 2)
    errors.nombre = "Ingresa tu nombre.";
  if (!correoValido(data.email)) errors.email = "Ingresa un correo válido.";
  if (!(data.asunto || "").trim()) errors.asunto = "Indica el asunto.";
  if ((data.mensaje || "").trim().length < 10)
    errors.mensaje = "Escribe al menos 10 caracteres.";
  return errors;
}
export function validarEntrega(data) {
  const errors = {};
  if ((data.nombre || "").trim().length < 3)
    errors.nombre = "Ingresa tu nombre completo.";
  if (!correoValido(data.email)) errors.email = "Ingresa un correo válido.";
  if (!runValido(data.run))
    errors.run = "Revisa el RUN y su dígito verificador.";
  if (!/^\+?[\d\s-]{8,16}$/.test(data.telefono || ""))
    errors.telefono = "Ingresa un teléfono válido.";
  const comunas = comunasDeRegion(data.region);
  if (!comunas.length) errors.region = "Selecciona una región válida.";
  if (!data.comuna?.trim()) errors.comuna = "Selecciona una comuna.";
  else if (!esUbicacionValida(data.region, data.comuna))
    errors.comuna = "Selecciona una comuna de la región indicada.";
  if ((data.direccion || "").trim().length < 5)
    errors.direccion = "Ingresa una dirección completa.";
  return errors;
}
export function validarRegistro(data) {
  const errors = validarEntrega(data);
  if (
    (data.password || "").length < 10 ||
    data.password.length > 72 ||
    !/[A-Za-z]/.test(data.password) ||
    !/\d/.test(data.password)
  )
    errors.password = "Usa entre 10 y 72 caracteres, con letras y números.";
  if (data.password !== data.confirmar)
    errors.confirmar = "Las contraseñas deben coincidir.";
  return errors;
}
