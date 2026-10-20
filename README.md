# Master Martini | Desarrollo Fullstack II - Evaluación Parcial 2

**Master Martini** es una aplicación web de comercio electrónico de carácter académico, orientada a insumos para panadería, pastelería, gelatería y food service. El proyecto incluye una tienda navegable, catálogo, carrito, simulación de compras, formularios y administración de productos.

## Plantilla de referencia y créditos

La interfaz de este proyecto se desarrolló tomando como base de referencia visual la plantilla **Fruitkha – Free Bootstrap 4 Responsive Food Business Template**, publicada en **ThemeWagon**:

https://themewagon.com/themes/fruitkha-free-bootstrap-4-responsive-food-business-template/

La ficha de ThemeWagon identifica a **Free CSS** como creador de la plantilla original. La apariencia, navegación y secciones se adaptaron a la identidad visual de Master Martini. **La implementación de esta entrega utiliza React 18, React Router 6, Vite 6 y Bootstrap 5**; por lo tanto, no debe confundirse la versión Bootstrap 4 de la plantilla original con las dependencias actuales del proyecto.

Referencia de licencia de ThemeWagon: https://themewagon.com/license/ . Los recursos fotográficos se utilizan como material demostrativo y mantienen sus respectivas condiciones de origen.

## Requisitos y puesta en marcha

- Node.js 20 o superior y npm.
- Visual Studio Code (o editor equivalente).
- Navegador web moderno, preferentemente Chrome.

Abra en Visual Studio Code **la carpeta del proyecto que contiene `package.json`**. En la terminal integrada ejecute:

```bash
npm install
npm run dev
```

Visite la dirección local indicada por Vite, habitualmente **http://localhost:5173/**.

Para generar y visualizar la versión optimizada de producción:

```bash
npm run build
npm run preview
```


## Funcionalidades

- Inicio con carrusel, categorías, novedades y ofertas.
- Catálogo de 12 productos de muestra, con búsqueda, filtros, ordenamiento y páginas de detalle.
- Carrito con control de cantidades, validación de existencias y cálculos de compra.
- Registro, inicio de sesión y perfiles demostrativos.
- Checkout simulado con validaciones y registro de pedidos.
- Administración de catálogo mediante operaciones de creación, consulta, actualización y eliminación.
- Persistencia local del catálogo, carrito, perfil y pedidos mediante `localStorage`.
- Interfaz adaptable a diferentes resoluciones y navegación entre páginas mediante React Router.

## Accesos de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@demo.cl` | `Admin123` |
| Vendedor | `vendedor@demo.cl` | `Venta123` |
| Cliente | `cliente@demo.cl` | `Cliente123` |

Estos accesos son parte de la demostración académica. No representan un sistema de autenticación seguro para producción.

## Pruebas y validación

El proyecto conserva las pruebas automatizadas y la evidencia de las validaciones realizadas durante su desarrollo. Los comandos disponibles son:

```bash
npm run check:syntax
npm run check:logic
npm run test:node
npm run test:assets
npm run test:api
npm run test:coverage
```

Las pruebas de componentes utilizan Jasmine y Karma con ChromeHeadless. El informe de cobertura se encuentra en `docs/INFORME_TESTING_COBERTURA_EP2.pdf`; los informes generados se incluyen en `testing/coverage/` y los registros de pruebas en `testing/evidence/`.

Para las pruebas integrales de navegador, mantenga `npm run dev` abierto y ejecute en otra terminal:

```bash
npm run test:e2e
```

## API local opcional

Por defecto, la aplicación utiliza datos locales y `localStorage`. Para utilizar la API educativa incluida en `server/api.mjs`, copie `.env.example` como `.env`, establezca `VITE_USE_BACKEND=true` y ejecute la API en otra terminal:

```bash
npm run api
```

Reinicie el servidor de Vite para aplicar el cambio de entorno. La API guarda sus datos en `server/.data/` (directorio generado durante la ejecución). Esta opción está pensada para pruebas locales.

## Organización del proyecto

| Ruta | Contenido |
| --- | --- |
| `src/components/` | Componentes reutilizables de interfaz |
| `src/pages/` | Páginas y vistas |
| `src/contexts/` | Estado global y operaciones de tienda |
| `src/data/` | Catálogo, categorías y contenidos iniciales |
| `src/utils/` | Validación, lógica comercial y persistencia |
| `public/assets/` | Fotografías, logotipo y recursos locales |
| `server/` | API de demostración en Node.js |
| `src/tests/` y `testing/` | Código de pruebas, cobertura y evidencia |
| `docs/` | Especificación de requisitos e informe de testing |

## Alcance académico

Los precios, existencias, pedidos, cuentas y pagos se simulan para fines de evaluación. El checkout no procesa pagos reales; el formulario de contacto y la suscripción no envían mensajes a servicios externos. La aplicación no debe utilizarse como tienda comercial real sin incorporar autenticación, infraestructura y controles de seguridad adicionales.
