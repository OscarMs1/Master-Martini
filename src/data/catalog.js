export const categories = [
  {
    id: 'panaderia',
    name: 'Panadería & Pastelería',
    subtitle: 'Insumos para preparaciones dulces y saladas.',
    image: '/assets/cat-panaderia.jpg',
    description: 'Margarinas, cremas y coberturas para creaciones profesionales.'
  },
  {
    id: 'gelateria',
    name: 'Gelatería',
    subtitle: 'Sabores y texturas de la tradición italiana.',
    image: '/assets/cat-gelateria.jpg',
    description: 'Bases, pastas y complementos para un gelato excepcional.'
  },
  {
    id: 'food-service',
    name: 'Food Service',
    subtitle: 'Soluciones para hoteles y restaurantes.',
    image: '/assets/cat-foodservice.jpg',
    description: 'Ingredientes prácticos para profesionales gastronómicos.'
  },
  {
    id: 'retail',
    name: 'Retail',
    subtitle: 'Productos para hogares y negocios.',
    image: '/assets/cat-retail.jpg',
    description: 'Bebidas vegetales y productos para el consumidor final.'
  }
];
// Productos/formatos basados en líneas reales. Precios, stock y descuentos ficticios para demo.
export const initialProducts = [
  {
    id: 'MM-001',
    name: 'Gran Master Hoja',
    brand: 'Master Martini',
    category: 'panaderia',
    format: '1 kg',
    description: 'Margarina vegetal para masas de hojaldre, croissants y masas danesas.',
    price: 5990,
    stock: 25,
    discount: 10,
    image: '/assets/catalog-MM-001.webp',
    sourceUrl: 'https://bicomfiles.s3-sa-east-1.amazonaws.com/ecommerce/444/444650107.png',
    featured: true
  },
  {
    id: 'MM-002',
    name: 'Bravo Crem',
    brand: 'Master Martini',
    category: 'panaderia',
    format: '1 L',
    description: 'Crema para batir y decorar preparaciones dulces con excelente rendimiento.',
    price: 4590,
    stock: 40,
    discount: 0,
    image: '/assets/prod-bravo-v2.png',
    sourceUrl:
      'https://destro.fbitsstatic.net/img/p/creme-culinario-bravo-crem-tetrapak-1l-89236/276234.jpg?h=1000&qs=ignore&v=202501231555&w=1000',
    featured: true
  },
  {
    id: 'MM-003',
    name: 'Monna Lisa',
    brand: 'Master Martini',
    category: 'panaderia',
    format: '1 L',
    description: 'Crema vegetal para decoraciones, coberturas y terminaciones de pastelería.',
    price: 5290,
    stock: 18,
    discount: 15,
    image: '/assets/catalog-MM-003.webp',
    sourceUrl:
      'https://backend.bakeryshop-ci.com/storage/images/MrD2r19aVg3MiddyFUyXlkn5fnl3PevBUZWiJ6rj.png',
    featured: true
  },
  {
    id: 'MM-004',
    name: 'OraSì Barista Avena',
    brand: 'OraSì',
    category: 'retail',
    format: '1 L',
    description: 'Bebida vegetal de avena, ideal para acompañar diferentes preparaciones.',
    price: 2990,
    stock: 32,
    discount: 15,
    image: '/assets/catalog-MM-004.webp',
    sourceUrl:
      'https://superxtrapanama.vtexassets.com/arquivos/ids/191781/8003180028194.png?v=638558686788300000',
    featured: true
  },
  {
    id: 'MM-005',
    name: 'Caravella Cobertura',
    brand: 'Master Martini',
    category: 'panaderia',
    format: '1 kg',
    description: 'Cobertura sabor chocolate para bañar, rellenar y decorar.',
    price: 7690,
    stock: 16,
    discount: 20,
    image: '/assets/catalog-MM-005.webp',
    sourceUrl:
      'https://mastermartini.cl/wp-content/uploads/2023/06/Caravella-chocolate-sucedaneos.jpg',
    imageNote: 'Fotografía oficial de la línea Caravella Dark; presentación referencial.'
  },
  {
    id: 'MM-006',
    name: 'Gran Master Horneo',
    brand: 'Master Martini',
    category: 'panaderia',
    format: '1 kg',
    description: 'Margarina para preparaciones de horno, de alto rendimiento.',
    price: 5790,
    stock: 20,
    discount: 0,
    image: '/assets/catalog-MM-006.webp',
    sourceUrl: 'https://r.bolder.run/23053/original/1026328-gran_master_%282%29.JPG'
  },
  {
    id: 'MM-007',
    name: 'Base Gelato Blanca UHT',
    brand: 'Martini Gelato',
    category: 'gelateria',
    format: '1 L',
    description: 'Base líquida para elaborar helado artesanal; agrega pasta o fruta.',
    price: 6490,
    stock: 15,
    discount: 10,
    image: '/assets/prod-base-gelato-uht-v2.jpg'
  },
  {
    id: 'MM-008',
    name: 'Pasta de Pistacho',
    brand: 'Martini Gelato',
    category: 'gelateria',
    format: '500 g',
    description: 'Pasta saborizante concentrada para heladería italiana.',
    price: 12990,
    stock: 12,
    discount: 0,
    image: '/assets/prod-pasta-pistacho-v2.jpg'
  },
  {
    id: 'MM-009',
    name: 'Master Gourmet',
    brand: 'Master Martini',
    category: 'food-service',
    format: '1 L',
    description: 'Crema neutra versátil para platos dulces y salados.',
    price: 4990,
    stock: 30,
    discount: 0,
    image: '/assets/prod-master-gourmet-encuadrado.png'
  },
  {
    id: 'MM-010',
    name: 'Casa Gianni Croissant',
    brand: 'Casa Gianni',
    category: 'food-service',
    format: 'Caja',
    description: 'Bollería congelada para servir fresca tras su preparación.',
    price: 11990,
    stock: 10,
    discount: 15,
    image: '/assets/catalog-MM-010.webp',
    sourceUrl:
      'https://www.martiniprofessional.net/img/containers/assets/products/martini-frozen/5070-mejor-vuoto-scaled.jpg/1ca04586c256061720f519ef8b5a06bb/5070-mejor-vuoto-scaled.jpg',
    imageNote:
      'Fotografía referencial de croissant Martini Frozen. La caja y el producto exacto pueden variar.'
  },
  {
    id: 'MM-011',
    name: 'OraSì Soya',
    brand: 'OraSì',
    category: 'retail',
    format: '1 L',
    description: 'Bebida vegetal de soya para consumo directo y preparaciones.',
    price: 2690,
    stock: 22,
    discount: 5,
    image: '/assets/catalog-MM-011.webp',
    sourceUrl:
      'https://aldeanativa.cl/cdn/shop/files/leche-soya-orasi-1-lt-orasi-aldea-nativa-532916.jpg?crop=center&height=1024&v=1718729764&width=1024',
    imageNote:
      'Fotografía e ilustración de respaldo referenciales; el envase puede variar según el distribuidor.'
  },
  {
    id: 'MM-012',
    name: 'Decor Up',
    brand: 'Master Martini',
    category: 'panaderia',
    format: '1 L',
    description: 'Crema vegetal azucarada para rellenos y decoración de pastelería.',
    price: 4490,
    stock: 0,
    discount: 0,
    image: '/assets/catalog-MM-012.webp',
    sourceUrl: 'https://xfood.cl/29455-large_default/crema-vegetal-decor-up-1-lt.jpg'
  }
];
export const posts = [
  {
    slug: 'croissants-de-mantequilla',
    tag: 'RECETAS',
    name: 'Croissants de hojaldre',
    desc: 'Técnicas para preparar hojaldres y obtener un acabado profesional.',
    image: '/assets/blog-croissant-unsplash.webp',
    text: 'El secreto del hojaldre está en la temperatura, el reposo y el laminado uniforme. Prueba la técnica con margarina apta para masas de hoja.'
  },
  {
    slug: 'tendencias-en-pasteleria',
    tag: 'NOVEDADES',
    name: 'Tendencias en pastelería',
    desc: 'Decoraciones, cremas vegetales y nuevas experiencias.',
    image: '/assets/blog-pastel-unsplash.webp',
    cardImage: '/assets/blog-pastel-tarjetas-centrado.webp',
    text: 'Explora formas de terminar pasteles con texturas delicadas y productos estables para vitrinas y servicios.'
  },
  {
    slug: 'gelato-artesanal',
    tag: 'RECETAS',
    name: 'Gelato artesanal',
    desc: 'Bases, sabores y consejos para helados con carácter italiano.',
    image: '/assets/blog-gelato-unsplash.webp',
    text: 'Trabaja con una base adecuada, sabores de calidad y un proceso controlado para obtener una textura de gelato equilibrada.'
  }
];
export const regions = {
  'Metropolitana de Santiago': [
    'Santiago',
    'Quilicura',
    'Renca',
    'Providencia',
    'Las Condes',
    'Maipú'
  ],
  Valparaíso: ['Valparaíso', 'Viña del Mar', 'Quilpué'],
  Biobío: ['Concepción', 'Talcahuano', 'Los Ángeles'],
  'O’Higgins': ['Rancagua', 'Machalí'],
  Maule: ['Talca', 'Curicó']
};

// Conserva los cambios administrativos, pero actualiza referencias fotográficas antiguas
// de tres productos cuando existen datos guardados de versiones anteriores.
const legacyProductPhotos = {
  'MM-002': ['/assets/prod-bravo.png'],
  'MM-007': [
    '/assets/cat-gelateria.jpg',
    '/assets/prod-base-gelato-uht.png',
    '/assets/prod-base-gelato-uht.jpg'
  ],
  'MM-008': ['/assets/cat-gelateria.jpg', '/assets/prod-pasta-pistacho.jpg'],
  'MM-009': [
    '/assets/blog-pastel.jpg',
    '/assets/prod-master-gourmet.png',
    '/assets/prod-master-gourmet-v2.png'
  ]
};
export function refreshCatalogProductMedia(products) {
  if (!Array.isArray(products)) return products;
  return products.map(product => {
    if (!product || !Object.hasOwn(legacyProductPhotos, product.id)) return product;
    const originals = legacyProductPhotos[product.id];
    const updated = initialProducts.find(p => p.id === product.id);
    if (!updated) return product;
    // Remove obsolete note text from any previously saved catalog entries.
    const { imageNote: _obsoleteNote, ...withoutNote } = product;
    return originals.includes(product.image)
      ? { ...withoutNote, image: updated.image }
      : withoutNote;
  });
}
