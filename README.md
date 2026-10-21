# Master Martini | Desarrollo Fullstack II - Evaluación Parcial 2

**Master Martini** es una aplicación web de comercio electrónico de carácter académico, orientada a insumos para panadería, pastelería, gelatería y food service. El proyecto incluye una tienda navegable, catálogo, carrito, simulación de compras, formularios y administración de productos.

## Plantilla de referencia y créditos

La interfaz de este proyecto se desarrolló tomando como base de referencia visual la plantilla **Fruitkha – Free Bootstrap 4 Responsive Food Business Template**, publicada en **ThemeWagon**:

https://themewagon.com/themes/fruitkha-free-bootstrap-4-responsive-food-business-template/

La ficha de ThemeWagon identifica a **Free CSS** como creador de la plantilla original. La apariencia, navegación y secciones se adaptaron a la identidad visual de Master Martini. **La implementación de esta entrega utiliza React 19, React Router 8, Vite 7, Vitest 5 y Bootstrap 5**; por lo tanto, no debe confundirse la versión Bootstrap 4 de la plantilla original con las dependencias actuales del proyecto.

Referencia de licencia de ThemeWagon: https://themewagon.com/license/ . Los recursos fotográficos se utilizan como material demostrativo y mantienen sus respectivas condiciones de origen.

## Repositorio público de la entrega

Código fuente y documentación del proyecto: **https://github.com/OscarMs1/Master-Martini**

El proyecto React se ejecuta en un entorno local con Vite siguiendo los comandos que se indican a continuación. No es necesario utilizar GitHub Pages para su ejecución.

## Requisitos y puesta en marcha

- Node.js 22.22 o superior (o Node.js 24) y npm.
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
- Página de **Clases de recetas** (`/clases`): cada clase muestra su receta paso a paso, fecha, cupos y los insumos del catálogo que se usan, con un botón para agregarlos al carrito y otro para inscribirse. Se puede filtrar por clases presenciales u online.
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

Las pruebas unitarias del frontend se hacen con **Vitest** y **React Testing Library**. Vitest usa **jsdom** para simular el navegador, así se pueden renderizar componentes React y hacer clic en ellos dentro de los tests.

```bash
npm test               # corre todas las pruebas una vez
npm run test:watch     # vuelve a correr las pruebas cada vez que se guarda un archivo
npm run test:coverage  # corre las pruebas y muestra el porcentaje de cobertura
```

La configuración de Vitest está en el bloque `test` de `vite.config.js`, y las pruebas están en `src/tests/pagina.test.jsx`. El reporte de cobertura se genera en la carpeta `coverage/`.

| N° | Prueba | Qué verifica |
| --- | --- | --- |
| 1 | `netPrice` | Aplica bien el descuento al precio |
| 2 | `shipping` | El envío es gratis desde $50.000 |
| 3 | `shipping` | El envío a domicilio cuesta $3.990 bajo $50.000 |
| 4 | `validRun` | Acepta un RUN válido y rechaza uno inválido |
| 5 | `validEmail` | Revisa el formato del correo |
| 6 | `addCart` | Suma cantidades sin repetir el producto en el carrito |
| 7 | `filteredProducts` | Filtra el catálogo por categoría |
| 8 | `ProductCard` | Muestra el nombre y el botón "Agregar" llama a `onAdd` (mock con `vi.fn`) |
| 9 | Datos de clases | Todos los insumos de las clases existen en el catálogo |
| 10 | Página `Clases` | Al inscribirse aparece el mensaje y baja un cupo |
| 11 | `writeStore` | Guarda el carrito en `localStorage` (spy con `vi.spyOn`) |
| 12 | Página `Catalog` | Muestra los productos que llegan desde la API (mock de `fetch` con `vi.stubGlobal`) |
| 13 | Página `Clases` | El filtro "Online" muestra solo las clases online |

**Mocks usados:**

- `vi.fn()`: crea una función falsa para comprobar que un componente la llama al hacer clic.
- `vi.spyOn()`: "espía" una función real (`localStorage.setItem`) para revisar con qué datos se llamó.
- `vi.stubGlobal()`: reemplaza `fetch` por una respuesta falsa, así el test no necesita la API corriendo.

Además, el proyecto mantiene otros scripts de validación que se ejecutan con Node:

```bash
npm run check:syntax
npm run check:logic
npm run test:node
npm run test:assets
npm run test:api
```

Para las pruebas de navegador, mantenga `npm run dev` abierto y ejecute en otra terminal:

```bash
npm run test:e2e
```

**Nota para Windows:** en `package.json`, el bloque `overrides` cambia Rollup y esbuild (las herramientas que usa Vite por dentro) por sus versiones WebAssembly. Así el proyecto funciona aunque Windows (Smart App Control) bloquee los archivos nativos.

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
| `src/components/admin/` | Componentes del panel de administración (`ProductForm`, `ProductTable`, `OrderList`) |
| `src/pages/` | Páginas y vistas |
| `src/contexts/` | Estado global y operaciones de tienda |
| `src/data/` | Catálogo, categorías y contenidos iniciales |
| `src/utils/` | Validación, lógica comercial y persistencia |
| `public/assets/` | Fotografías, logotipo y recursos locales |
| `server/` | API de demostración en Node.js |
| `src/tests/` | Pruebas unitarias con Vitest |
| `testing/` | Scripts de validación con Node y evidencia |
| `docs/` | Especificación de requisitos e informe de testing |

## Alcance académico

Los precios, existencias, pedidos, cuentas y pagos se simulan para fines de evaluación. El checkout no procesa pagos reales; el formulario de contacto y la suscripción no envían mensajes a servicios externos. La aplicación no debe utilizarse como tienda comercial real sin incorporar autenticación, infraestructura y controles de seguridad adicionales.
