// Clases de recetas que ofrece Master Martini.
// En "insumos" va el id del producto del catálogo (ver src/data/catalog.js)
// y la cantidad que se recomienda comprar para hacer la receta.

export const clases = [
  {
    id: 'croissant',
    titulo: 'Croissant de mantequilla',
    modalidad: 'Presencial',
    fecha: '12 de noviembre',
    hora: '10:00',
    lugar: 'Quilicura, Santiago',
    duracion: '3 h',
    nivel: 'Medio',
    cupos: 12,
    imagen: '/assets/blog-croissant-unsplash.webp',
    descripcion:
      'Aprende a laminar la masa y lograr un croissant crujiente por fuera y suave por dentro.',
    pasos: [
      'Preparar la masa base y dejarla reposar en frío.',
      'Laminar la masa con margarina en tres dobleces.',
      'Cortar, formar los croissants y dejarlos fermentar.',
      'Hornear a 180 °C por 18 minutos.'
    ],
    insumos: [
      { id: 'MM-001', cantidad: 1 },
      { id: 'MM-006', cantidad: 1 }
    ]
  },
  {
    id: 'helado-pistacho',
    titulo: 'Helado italiano de pistacho',
    modalidad: 'Presencial',
    fecha: '19 de noviembre',
    hora: '11:00',
    lugar: 'Quilicura, Santiago',
    duracion: '2 h',
    nivel: 'Fácil',
    cupos: 8,
    imagen: '/assets/blog-gelato-unsplash.webp',
    descripcion: 'Prepara un gelato cremoso usando una base lista y pasta de pistacho.',
    pasos: [
      'Mezclar la base de gelato con la pasta de pistacho.',
      'Batir en la máquina de helados por 15 minutos.',
      'Congelar y servir.'
    ],
    insumos: [
      { id: 'MM-007', cantidad: 2 },
      { id: 'MM-008', cantidad: 1 }
    ]
  },
  {
    id: 'tartaleta-frambuesa',
    titulo: 'Tartaleta de frambuesa',
    modalidad: 'Online',
    fecha: '26 de noviembre',
    hora: '18:30',
    lugar: 'Por videollamada',
    duracion: '1 h 30 min',
    nivel: 'Fácil',
    cupos: 30,
    imagen: '/assets/blog-pastel-unsplash.webp',
    descripcion: 'Una tartaleta de masa quebrada con crema batida y frambuesas frescas.',
    pasos: [
      'Preparar la masa quebrada con margarina y hornearla.',
      'Batir la crema hasta que esté firme.',
      'Rellenar la tartaleta con la crema.',
      'Decorar con frambuesas frescas.'
    ],
    insumos: [
      { id: 'MM-006', cantidad: 1 },
      { id: 'MM-002', cantidad: 1 }
    ]
  },
  {
    id: 'torta-frutos-rojos',
    titulo: 'Torta de crema con frutos rojos',
    modalidad: 'Online',
    fecha: '3 de diciembre',
    hora: '19:00',
    lugar: 'Por videollamada',
    duracion: '2 h',
    nivel: 'Medio',
    cupos: 40,
    imagen: '/assets/cat-retail.jpg',
    descripcion:
      'Arma una torta de bizcocho con crema vegetal y una base de chocolate, decorada con frutos rojos.',
    pasos: [
      'Hornear el bizcocho y cortarlo en capas.',
      'Bañar la primera capa con la cobertura de chocolate.',
      'Rellenar y cubrir la torta con crema vegetal batida.',
      'Decorar con frutillas, arándanos y frambuesas.'
    ],
    insumos: [
      { id: 'MM-003', cantidad: 2 },
      { id: 'MM-005', cantidad: 1 }
    ]
  }
];
