// Fotografía única por artículo, reutilizada en tarjetas, portada y detalle.
// Las fotos fueron proporcionadas para este proyecto; no se atribuyen a terceros sin verificar.
export const imagenesNovedades = {
  "el-arte-del-laminado": {
    src: "/assets/images/novedad-laminado.jpg",
    alt: "Manos de una persona trabajando y extendiendo masa sobre una mesa enharinada",
  },
  "texturas-de-chocolate": {
    src: "/assets/images/novedad-chocolate.jpg",
    alt: "Trufas de chocolate cubiertas con cacao en polvo",
  },
  "un-gelato-con-identidad": {
    src: "/assets/images/novedad-gelato.jpg",
    alt: "Servicio de gelato artesanal servido desde una vitrina de sabores",
  },
};

export function imagenParaNovedad(articulo) {
  if (articulo.imagen?.startsWith("/api/imagenes/")) return articulo.imagen;
  return imagenesNovedades[articulo.slug]?.src || articulo.imagen;
}

export function altParaNovedad(articulo) {
  if (articulo.imagen?.startsWith("/api/imagenes/")) return articulo.titulo;
  return imagenesNovedades[articulo.slug]?.alt || articulo.titulo;
}
