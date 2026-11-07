/**
 * Selección reducida para los formularios de Master Martini:
 * 8 regiones y 173 comunas reales de Chile (no es un catálogo territorial completo).
 * Los datos se basan en el catálogo territorial incluido en el proyecto anterior.
 * No hace solicitudes externas. Tanto registro como checkout reutilizan este módulo.
 */
export const REGIONES_COMUNAS_CHILE = [
  {
    "region": "Región de Antofagasta",
    "comunas": [
      "Antofagasta",
      "Calama",
      "María Elena",
      "Mejillones",
      "Ollagüe",
      "San Pedro de Atacama",
      "Sierra Gorda",
      "Taltal",
      "Tocopilla"
    ]
  },
  {
    "region": "Región de Coquimbo",
    "comunas": [
      "Andacollo",
      "Canela",
      "Combarbalá",
      "Coquimbo",
      "Illapel",
      "La Higuera",
      "La Serena",
      "Los Vilos",
      "Monte Patria",
      "Ovalle",
      "Paihuano",
      "Punitaqui",
      "Río Hurtado",
      "Salamanca",
      "Vicuña"
    ]
  },
  {
    "region": "Región de Valparaíso",
    "comunas": [
      "Algarrobo",
      "Cabildo",
      "Calera",
      "Calle Larga",
      "Cartagena",
      "Casablanca",
      "Catemu",
      "Concón",
      "El Quisco",
      "El Tabo",
      "La Cruz",
      "La Ligua",
      "Limache",
      "Los Andes",
      "Olmué",
      "Papudo",
      "Puchuncaví",
      "Quillota",
      "Quilpué",
      "Quintero",
      "San Antonio",
      "San Felipe",
      "Valparaíso",
      "Villa Alemana",
      "Viña del Mar"
    ]
  },
  {
    "region": "Región Metropolitana de Santiago",
    "comunas": [
      "Cerrillos",
      "Cerro Navia",
      "Colina",
      "Conchalí",
      "El Bosque",
      "Estación Central",
      "Huechuraba",
      "Independencia",
      "La Cisterna",
      "La Florida",
      "La Granja",
      "La Pintana",
      "La Reina",
      "Lampa",
      "Las Condes",
      "Lo Barnechea",
      "Lo Espejo",
      "Lo Prado",
      "Macul",
      "Maipú",
      "Padre Hurtado",
      "Pedro Aguirre Cerda",
      "Peñaflor",
      "Peñalolén",
      "Providencia",
      "Pudahuel",
      "Puente Alto",
      "Quilicura",
      "Quinta Normal",
      "Recoleta",
      "Renca",
      "San Bernardo",
      "San Joaquín",
      "San Miguel",
      "Santiago",
      "Talagante",
      "Vitacura",
      "Ñuñoa"
    ]
  },
  {
    "region": "Región del Libertador General Bernardo O'Higgins",
    "comunas": [
      "Chimbarongo",
      "Chépica",
      "Codegua",
      "Coinco",
      "Coltauco",
      "Doñihue",
      "Graneros",
      "La Estrella",
      "Machalí",
      "Malloa",
      "Mostazal",
      "Nancagua",
      "Olivar",
      "Pichilemu",
      "Placilla",
      "Rancagua",
      "Rengo",
      "Requínoa",
      "San Fernando",
      "Santa Cruz"
    ]
  },
  {
    "region": "Región del Maule",
    "comunas": [
      "Cauquenes",
      "Chanco",
      "Colbún",
      "Constitución",
      "Curepto",
      "Curicó",
      "Empedrado",
      "Hualañé",
      "Licantén",
      "Linares",
      "Longaví",
      "Maule",
      "Molina",
      "Parral",
      "Pelarco",
      "Pelluhue",
      "Rauco",
      "Sagrada Familia",
      "San Javier",
      "Talca",
      "Teno"
    ]
  },
  {
    "region": "Región del Biobío",
    "comunas": [
      "Alto Biobío",
      "Antuco",
      "Arauco",
      "Cabrero",
      "Cañete",
      "Chiguayante",
      "Concepción",
      "Contulmo",
      "Coronel",
      "Curanilahue",
      "Florida",
      "Hualpén",
      "Hualqui",
      "Laja",
      "Lebu",
      "Los Ángeles",
      "Lota",
      "Mulchén",
      "Nacimiento",
      "Penco",
      "San Pedro de la Paz",
      "Santa Bárbara",
      "Talcahuano",
      "Tomé",
      "Yumbel"
    ]
  },
  {
    "region": "Región de Los Lagos",
    "comunas": [
      "Ancud",
      "Calbuco",
      "Castro",
      "Chaitén",
      "Chonchi",
      "Cochamó",
      "Curaco de Vélez",
      "Dalcahue",
      "Fresia",
      "Frutillar",
      "Llanquihue",
      "Los Muermos",
      "Osorno",
      "Puerto Montt",
      "Puerto Octay",
      "Puerto Varas",
      "Purranque",
      "Puyehue",
      "Quellón",
      "Río Negro"
    ]
  }
];

export const regionesChile = REGIONES_COMUNAS_CHILE.map(({ region }) => region);

export function comunasDeRegion(region) {
  return REGIONES_COMUNAS_CHILE.find((item) => item.region === region)?.comunas ?? [];
}

export function esUbicacionValida(region, comuna) {
  return comunasDeRegion(region).includes(comuna);
}

/** Normaliza regiones registradas antiguamente como texto libre (si se reconocen). */
export function regionCanonica(region = "") {
  const simplificar = (texto) => (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();

  const entrada = simplificar(region);
  if (!entrada) return "";
  const alias = {
    rm: "Región Metropolitana de Santiago",
    metropolitana: "Región Metropolitana de Santiago",
    "region metropolitana": "Región Metropolitana de Santiago",
    "metropolitana de santiago": "Región Metropolitana de Santiago",
    santiago: "Región Metropolitana de Santiago",
    "o higgins": "Región del Libertador General Bernardo O'Higgins",
    ohiggins: "Región del Libertador General Bernardo O'Higgins",
    "libertador bernardo o higgins": "Región del Libertador General Bernardo O'Higgins",
    magallanes: "Región de Magallanes y de la Antártica Chilena",
    aysen: "Región de Aysén del General Carlos Ibáñez del Campo",
    aisen: "Región de Aysén del General Carlos Ibáñez del Campo",
    araucania: "Región de La Araucanía",
    "bio bio": "Región del Biobío",
    biobio: "Región del Biobío",
  };
  if (alias[entrada] && REGIONES_COMUNAS_CHILE.some(({ region }) => region === alias[entrada])) return alias[entrada];
  const encontrada = REGIONES_COMUNAS_CHILE.find(({ region: nombre }) => {
    const completo = simplificar(nombre);
    const corto = completo.replace(/^region (de |del )?/, "");
    return entrada === completo || entrada === corto;
  });
  return encontrada?.region ?? "";
}
