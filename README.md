<div align="center">

# Master Martini

### Plataforma de comercio electrónico · Desarrollo Fullstack II

**Evaluación Parcial 2 · DSY1104 · Duoc UC**

![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

**[Repositorio](https://github.com/OscarMs1/Master-Martini)** · **[Documentación](docs/ERS_MASTER_MARTINI_EP2.pdf)** · **[Informe de pruebas](docs/INFORME_TESTING_COBERTURA_EP2.pdf)**

</div>

---

## Descripción general

**Master Martini** es una aplicación web de comercio electrónico desarrollada como proyecto académico de **Desarrollo Fullstack II**, orientada a la venta de insumos para **panadería, pastelería, gelatería y food service**.

La plataforma integra un catálogo de productos, carrito de compras, gestión de usuarios, simulación de pedidos, administración de productos y un módulo de clases de recetas. Su implementación utiliza una arquitectura frontend basada en **componentes React**, con separación de responsabilidades entre presentación, estado, datos y lógica de negocio.

El desarrollo pone énfasis en la **reutilización de componentes**, el **enrutamiento**, la **validación de formularios**, el **diseño adaptable** y las **pruebas automatizadas**.

## Tecnologías utilizadas

| Tecnología | Versión | Propósito |
|:--|:--|:--|
| React | 19 | Componentes y renderizado de la interfaz |
| React Router | 8 | Navegación entre vistas |
| Vite | 7 | Desarrollo local y compilación para producción |
| JavaScript | ES Modules | Lógica de negocio e interacción |
| Bootstrap | 5 | Diseño responsive y componentes visuales |
| Lucide React | 1.x | Iconografía |
| Context API | React 19 | Gestión de estado compartido |
| Node.js | 22.22.2+ o 24 | Herramientas de desarrollo y API local |
| Vitest | 5 | Pruebas automatizadas |
| React Testing Library | 16 | Pruebas de componentes e interacción |
| Playwright | 1.x | Pruebas en navegador |

## Funcionalidades

### Catálogo y proceso de compra

- Página de inicio con carrusel, categorías, novedades y ofertas.
- Catálogo de demostración con **12 productos**, búsqueda, filtros, ordenamiento y páginas de detalle.
- Carrito con gestión de cantidades, validación de existencias y cálculo de totales.
- Checkout simulado con formularios validados y registro de pedidos.

### Usuarios y administración

- Registro, inicio de sesión y perfiles demostrativos.
- Roles de **cliente, vendedor y administrador**.
- Administración de catálogo mediante operaciones **CRUD**.
- Consulta de pedidos y persistencia local de datos con `localStorage`.

### Clases de recetas

El módulo **`/clases`** relaciona actividades formativas con productos del catálogo:

- Recetas, fechas, modalidad y cupos disponibles.
- Inscripción en clases presenciales u online.
- Filtro por modalidad.
- Incorporación al carrito de los insumos asociados a cada receta.
- Consulta de inscripciones en **Mi cuenta → Mis clases de recetas**.

## Arquitectura y organización

```text
master-martini/
├── public/
│   └── assets/             # Recursos visuales
├── src/
│   ├── components/         # Componentes reutilizables
│   │   └── admin/          # Panel de administración
│   ├── contexts/           # Estado global de la tienda
│   ├── data/               # Datos y catálogos iniciales
│   ├── pages/              # Vistas y páginas
│   ├── styles/             # Estilos de la aplicación
│   ├── tests/              # Pruebas con Vitest
│   ├── utils/              # Validaciones y lógica comercial
│   ├── App.jsx             # Composición y rutas
│   └── main.jsx            # Entrada de React
├── server/                 # API local de demostración
├── testing/                # Pruebas complementarias y evidencias
├── docs/                   # Documentación técnica
├── package.json
└── vite.config.js
```

La interfaz se construye en `components/` y `pages/`; `ShopContext` coordina el estado compartido de la tienda, mientras `utils/` concentra funciones de validación, cálculo comercial y persistencia. Los datos iniciales se encuentran en `src/data/`, con una **API local opcional** para pruebas de integración.

## Instalación y ejecución

### Requisitos

- **Node.js 22.22.2 o superior**, o Node.js 24, y npm.
- Visual Studio Code u otro editor compatible.
- Un navegador web moderno.

### 1. Clonar e instalar

```bash
git clone https://github.com/OscarMs1/Master-Martini.git
cd Master-Martini
npm install
```

### 2. Ejecutar en desarrollo

```bash
npm run dev
```

Abre la dirección indicada por Vite en la terminal, habitualmente **http://localhost:5173/**.

### 3. Compilar y previsualizar

```bash
npm run build
npm run preview
```

La compilación genera los recursos optimizados en la carpeta `dist/`.

> **Nota para Windows:** `package.json` configura versiones WebAssembly de Rollup y esbuild mediante `overrides`, para favorecer la compatibilidad con sistemas que restringen binarios nativos.

## Pruebas y calidad

La aplicación utiliza **Vitest**, **React Testing Library** y `jsdom` para comprobar tanto funciones de negocio como interacciones con componentes.

| Comando | Función |
|:--|:--|
| `npm test` | Ejecutar pruebas frontend |
| `npm run test:watch` | Ejecutar Vitest en modo observación |
| `npm run test:coverage` | Generar reporte de cobertura V8 |
| `npm run check:syntax` | Verificar sintaxis |
| `npm run check:logic` | Ejecutar comprobaciones generales de lógica |
| `npm run test:node` | Probar utilidades comerciales con Node |
| `npm run test:assets` | Validar referencias de recursos |
| `npm run test:api` | Ejecutar pruebas de integración de API |
| `npm run test:e2e` | Ejecutar pruebas de navegador con el servidor de desarrollo abierto |

### Resultados de la evaluación

Los siguientes resultados corresponden a la ejecución de pruebas de la entrega EP2:

| Indicador | Resultado |
|:--|--:|
| Pruebas frontend Vitest | **13/13 aprobadas** |
| Cobertura de líneas | **45,54 %** |
| Cobertura de funciones | **37,91 %** |
| Cobertura de ramas | **34,83 %** |
| Cobertura de sentencias | **38,40 %** |
| Compilación Vite para producción | **Exitosa** |

Entre los escenarios probados se incluyen cálculos de precios y despacho, validación de RUN y correo, gestión del carrito, filtrado de productos, interacción con componentes, almacenamiento local y simulación de respuestas HTTP mediante mocks.

**La cobertura expresa qué parte del código fue ejecutada por estas pruebas; no equivale a una validación exhaustiva de toda la aplicación.** El detalle de metodología y evidencias se encuentra en el [informe de testing](docs/INFORME_TESTING_COBERTURA_EP2.pdf).

## API local opcional

En su configuración inicial, la aplicación utiliza datos locales y persistencia en `localStorage`. Para habilitar la API educativa de `server/api.mjs`:

1. Copia `.env.example` como `.env`.
2. Define `VITE_USE_BACKEND=true`.
3. Inicia la API y Vite en **terminales separadas**:

```bash
npm run api
```

```bash
npm run dev
```

El proxy de Vite dirige las solicitudes `/api` al servidor local en `http://127.0.0.1:3001`. Reinicia Vite si cambiaste las variables del archivo `.env`.

## Accesos de demostración

| Perfil | Correo | Contraseña |
|:--|:--|:--|
| Administrador | `admin@demo.cl` | `Admin123` |
| Vendedor | `vendedor@demo.cl` | `Venta123` |
| Cliente | `cliente@demo.cl` | `Cliente123` |

Estos accesos se incluyen **exclusivamente con fines de demostración**. No constituyen un mecanismo de autenticación seguro para un entorno productivo.

## Documentación

| Documento | Contenido |
|:--|:--|
| [Especificación de Requisitos de Software (ERS)](docs/ERS_MASTER_MARTINI_EP2.pdf) | Alcance, requisitos funcionales y no funcionales |
| [Informe de Testing y Cobertura](docs/INFORME_TESTING_COBERTURA_EP2.pdf) | Metodología, validaciones, resultados y evidencias |

Las pruebas y sus registros complementarios están disponibles en `src/tests/` y `testing/`.

## Diseño y atribuciones

La propuesta visual de Master Martini toma como referencia la plantilla **[Fruitkha — Free Bootstrap 4 Responsive Food Business Template](https://themewagon.com/themes/fruitkha-free-bootstrap-4-responsive-food-business-template/)**, distribuida a través de ThemeWagon y atribuida a **Free CSS** en su ficha de publicación.

La interfaz y los contenidos fueron adaptados a la identidad del proyecto, con una implementación en React y Bootstrap 5. Se reconocen los derechos de los autores de la plantilla y de los recursos fotográficos utilizados.

- [Licencia de referencia de ThemeWagon](https://themewagon.com/license/)

## Alcance académico

**Master Martini es un prototipo funcional con fines de evaluación.** Los productos, precios, existencias, cuentas, pedidos y pagos se emplean en un entorno de simulación. El checkout **no procesa pagos reales**, y los formularios de contacto y suscripción no están conectados a servicios de mensajería externos.

Antes de un uso comercial real sería necesario integrar autenticación y autorización seguras, persistencia centralizada, servicios de pago, controles de seguridad y una infraestructura de operación adecuada.

---

<div align="center">

**Master Martini · Desarrollo Fullstack II · Duoc UC**

Desarrollado con React, Vite y tecnologías web modernas.

</div>
