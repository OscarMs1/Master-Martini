// Selección de nueve fotografías reales de Unsplash para los collages.
// Los enlaces originales y la autoría quedan documentados aquí, sin texto visible en la web.
// Unsplash optimiza formato y tamaño según el navegador; srcSet evita descargar fotos de 1400 px en móviles.
const construirUrl = (id, width) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=68`;
const foto = (id, alt, autor, pagina) => ({
  src: construirUrl(id, 720),
  srcSet: [360, 520, 720, 960, 1200]
    .map((width) => `${construirUrl(id, width)} ${width}w`).join(", "),
  alt,
  autor,
  pagina,
});

export const collagesNovedades = {
  'texturas-de-chocolate': [
    foto('photo-1518091128136-3b02100d789a', 'Postre de mousse de chocolate con acabado elegante', 'Jordane Mathieu', 'https://unsplash.com/photos/chocolate-cake-9trWI5ULtJQ'),
    foto('photo-1777897305246-353f651d956e', 'Chef decorando un postre con chocolate', 'Tommaso Ubezio', 'https://unsplash.com/photos/chef-garnishing-dessert-with-chocolate-sauce-and-shavings-VVxzs6d054Q'),
    foto('photo-1777647296575-d625bad442b6', 'Chocolate fundido cayendo de un batidor', 'Arwen', 'https://unsplash.com/photos/melted-chocolate-dripping-from-a-whisk-ksKS9hC4pOY'),
  ],
  'el-arte-del-laminado': [
    foto('photo-1765100214138-05ccfe25d216', 'Milhojas de crema y frambuesa que muestra sus capas de hojaldre', 'Vitalii Kyktov', 'https://unsplash.com/photos/slice-of-cake-with-raspberries-and-coffee-Ck3_8z7oAHs'),
    foto('photo-1768204036457-27f4f4201c3b', 'Detalle de hojaldre dorado de múltiples capas', 'Lee Milo', 'https://unsplash.com/photos/close-up-of-a-flaky-golden-brown-pastry-swirl-3jZzaITPxKg'),
    foto('photo-1758221617316-1fa0fab44324', 'Detalle de relleno cremoso entre capas de pastelería', 'Marie G.', 'https://unsplash.com/photos/close-up-of-a-creamy-pastry-filling-with-flaky-layers-300_KGHRIJ0'),
  ],
  'un-gelato-con-identidad': [
    foto('photo-1762857362159-840f0b18dc8e', 'Dos sabores de gelato italiano artesanal servidos en un vaso', 'Emanuel Ekström', 'https://unsplash.com/photos/two-scoops-of-ice-cream-in-a-colorful-cup-1xz6p1zpUoY'),
    foto('photo-1753997737223-a54d0834a12e', 'Sabores de gelato expuestos en una vitrina artesanal', 'Zed Can', 'https://unsplash.com/photos/delicious-gelato-flavors-are-displayed-in-metal-containers-qcRpMT1yRzY'),
    foto('photo-1775582324828-394cfdd0106a', 'Gelato de arándanos con textura cremosa y ondulada', 'Ishaan Sen', 'https://unsplash.com/photos/swirled-blueberry-ice-cream-in-a-metal-pan-RBT1hujIljs'),
  ],
};

export function collageParaNovedad(articulo) {
  const fotos = collagesNovedades[articulo?.slug];
  // Para futuras noticias sin set editorial, no romper la página: usar su imagen API.
  return fotos || [{
    src: articulo?.imagen || '',
    alt: articulo?.titulo || 'Imagen del artículo',
    autor: '',
    pagina: '',
  }];
}
