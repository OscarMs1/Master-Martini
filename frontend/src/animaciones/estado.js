// Pequeña señal compartida: la portada y las secciones esperan a que termine
// la intro de los cocineros antes de "construirse".
let lista = false;
const oyentes = new Set();

export function puedeAnimar() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function cocinaLista() {
  return lista;
}

export function marcarCocinaLista() {
  lista = true;
  oyentes.forEach((cb) => cb());
  oyentes.clear();
}

export function cuandoCocinaLista(cb) {
  if (lista) {
    cb();
    return () => {};
  }
  oyentes.add(cb);
  return () => oyentes.delete(cb);
}
