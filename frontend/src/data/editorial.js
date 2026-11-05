export const categorias = [
  {
    id: "panaderia",
    nombre: "Panadería & Pastelería",
    detalle: "El comienzo de algo extraordinario.",
    imagen: "panaderia.jpg",
  },
  {
    id: "gelateria",
    nombre: "Gelatería",
    detalle: "La tradición italiana, a cucharadas.",
    imagen: "categoria-gelato.jpg",
  },
  {
    id: "food-service",
    nombre: "Food Service",
    detalle: "Versatilidad para tu cocina.",
    imagen: "cocina.jpg",
  },
  {
    id: "retail",
    nombre: "Retail",
    detalle: "Inspiración para cada día.",
    imagen: "categoria-retail.jpg",
  },
];
export const categoriaNombre = (id) =>
  categorias.find((c) => c.id === id)?.nombre || id;
