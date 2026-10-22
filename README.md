
<h1 align="center">Master Martini</h1>

<h3 align="center">Tienda online de insumos gastronómicos | Desarrollo Fullstack II</h3>

<p align="center">
  <strong>Evaluación Parcial 2 · DSY1104 · Duoc UC</strong>
</p>

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img alt="Vite 7" src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img alt="Bootstrap 5" src="https://img.shields.io/badge/Bootstrap-5-7952B3?style=flat-square&logo=bootstrap&logoColor=white" />
  <img alt="Vitest 5" src="https://img.shields.io/badge/Vitest-5-6E9F18?style=flat-square&logo=vitest&logoColor=white" />
</p>

<p align="center">
  <a href="https://github.com/OscarMs1/Master-Martini">Repositorio</a> ·
  <a href="docs/ERS_MASTER_MARTINI_EP2.pdf">Requisitos del proyecto</a> ·
  <a href="docs/INFORME_TESTING_COBERTURA_EP2.pdf">Informe de pruebas</a>
</p>

---

## Sobre el proyecto

**Master Martini** es una página web de comercio electrónico desarrollada para la asignatura **Desarrollo Fullstack II**. Está enfocada en la venta de insumos para **panadería, pastelería, gelatería y food service**.

El objetivo del proyecto es aplicar los conocimientos de desarrollo frontend en una tienda que permita navegar por productos, gestionar un carrito, completar una compra de prueba y utilizar distintas funciones según el tipo de usuario.

La aplicación se desarrolló con **React** y utiliza componentes reutilizables, navegación entre páginas, formularios con validaciones y almacenamiento local para conservar información durante el uso.

## Tecnologías utilizadas

| Tecnología | Uso en el proyecto |
| --- | --- |
| **React 19** | Construcción de las páginas y componentes |
| **JavaScript** | Funciones, validaciones y lógica de la tienda |
| **React Router 8** | Navegación entre secciones |
| **Vite 7** | Ejecución local y compilación |
| **Bootstrap 5 y CSS** | Diseño visual y adaptación a distintas pantallas |
| **Context API** | Compartir información como el carrito y las inscripciones |
| **Node.js** | Ejecución de pruebas y API local de demostración |
| **Vitest y React Testing Library** | Pruebas de funciones y componentes |
| **Playwright** | Pruebas de navegación en el navegador |

## Funcionalidades principales

### Tienda y compras

- Inicio con carrusel de imágenes, categorías, novedades y ofertas.
- Catálogo de **12 productos de demostración** con búsqueda, filtros y ordenamiento.
- Información detallada de los productos.
- Carrito con selección de cantidades, cálculo de totales y revisión del stock disponible.
- Proceso de compra simulado con validación de los datos ingresados.

### Usuarios y administración

- Registro e inicio de sesión para cuentas de demostración.
- Perfiles de **cliente, vendedor y administrador**.
- Sección de administración para agregar, consultar, editar y eliminar productos.
- Consulta de pedidos e información de la cuenta.
- Almacenamiento local de datos como el carrito, los usuarios y los pedidos.

### Clases de recetas

La sección **Clases de recetas** (`/clases`) permite consultar actividades relacionadas con los productos de la tienda.

- Ver recetas, fechas, cupos y modalidad de cada clase.
- Filtrar clases presenciales y online.
- Inscribirse en actividades disponibles.
- Agregar al carrito los insumos necesarios para una receta.
- Revisar las inscripciones desde **Mi cuenta → Mis clases de recetas**.

## Organización del proyecto

```text
master-martini/
├── public/assets/       # Imágenes y recursos de la página
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── contexts/        # Información compartida de la tienda
│   ├── data/            # Productos y contenido inicial
│   ├── pages/           # Páginas del sitio
│   ├── styles/          # Estilos CSS
│   ├── tests/           # Pruebas de React con Vitest
│   ├── utils/           # Validaciones y funciones de apoyo
│   ├── App.jsx          # Rutas principales
│   └── main.jsx         # Inicio de la aplicación
├── server/              # API local de demostración
├── testing/             # Otras pruebas y evidencias
├── docs/                # Documentos de la evaluación
├── package.json
└── vite.config.js
```

El proyecto está dividido en carpetas para mantener organizadas las páginas, los componentes, los datos y las funciones. Así es más fácil encontrar el código y realizar cambios sin afectar otras secciones.

## Cómo ejecutar el proyecto

### Requisitos

- **Node.js 22.22.2 o superior**, o Node.js 24, con npm.
- Visual Studio Code u otro editor de código.
- Un navegador web actualizado.

### 1. Descargar el proyecto

```bash
git clone https://github.com/OscarMs1/Master-Martini.git
cd Master-Martini
```

También se puede descargar el repositorio como ZIP desde GitHub y abrir la carpeta que contiene `package.json`.

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Iniciar la página

```bash
npm run dev
```

Abrir en el navegador la dirección que aparece en la terminal, normalmente **http://localhost:5173/**.

### 4. Generar la versión de producción

```bash
npm run build
npm run preview
```

El primer comando prepara los archivos optimizados dentro de `dist/`, y el segundo permite revisarlos en el navegador.

## Pruebas realizadas

Para comprobar el funcionamiento del proyecto se utilizaron **Vitest** y **React Testing Library**. Las pruebas revisan cálculos de la tienda, validaciones de formularios y algunas interacciones con componentes React.

| Comando | ¿Qué hace? |
| --- | --- |
| `npm test` | Ejecuta las pruebas de React |
| `npm run test:coverage` | Muestra qué parte del código fue revisada por las pruebas |
| `npm run test:watch` | Permite ejecutar las pruebas mientras se desarrolla |
| `npm run test:node` | Revisa funciones de la tienda |
| `npm run test:assets` | Comprueba las referencias a imágenes y otros recursos |
| `npm run test:api` | Prueba la API local |
| `npm run check:syntax` | Revisa la sintaxis de archivos JavaScript |
| `npm run check:logic` | Realiza comprobaciones generales del proyecto |
| `npm run test:e2e` | Ejecuta pruebas de navegador con la página iniciada |

### Resultados de la evaluación

| Resultado | Valor |
| --- | ---: |
| Pruebas de Vitest aprobadas | **13 de 13** |
| Cobertura de líneas | **45,54 %** |
| Cobertura de funciones | 37,91 % |
| Cobertura de ramas | 34,83 % |
| Cobertura de sentencias | 38,40 % |
| Compilación con Vite | **Exitosa** |

Las pruebas incluyen descuentos, costos de despacho, validación de RUN y correo, carrito de compras, filtros, inscripciones a clases y visualización de productos.

**La cobertura no es del 100 %**: los porcentajes indican qué parte del código se ejecutó durante las pruebas.

Los resultados y las evidencias se explican con más detalle en el [informe de testing](docs/INFORME_TESTING_COBERTURA_EP2.pdf).

## Cuentas para probar la aplicación

| Perfil | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@demo.cl` | `Admin123` |
| Vendedor | `vendedor@demo.cl` | `Venta123` |
| Cliente | `cliente@demo.cl` | `Cliente123` |

Estas cuentas se utilizan solo para mostrar el funcionamiento de la aplicación durante la evaluación.

## API local (opcional)

El proyecto puede funcionar utilizando los datos incluidos en la aplicación y `localStorage`. También cuenta con una API local de ejemplo en `server/api.mjs` para realizar pruebas.

Para utilizarla, copiar `.env.example` como `.env`, cambiar el valor `VITE_USE_BACKEND` a `true` y ejecutar estos comandos en dos terminales distintas:

**Terminal 1:**

```bash
npm run api
```

**Terminal 2:**

```bash
npm run dev
```

Si se modifica el archivo `.env`, se debe reiniciar Vite para aplicar el cambio.

## Documentación

| Documento | Contenido |
| --- | --- |
| [Especificación de Requisitos (ERS)](docs/ERS_MASTER_MARTINI_EP2.pdf) | Objetivos, alcance y requisitos del sistema |
| [Informe de Testing y Cobertura](docs/INFORME_TESTING_COBERTURA_EP2.pdf) | Pruebas, resultados y evidencias |

## Diseño y créditos

El diseño de Master Martini se desarrolló tomando como referencia la plantilla **Fruitkha — Free Bootstrap 4 Responsive Food Business Template**, disponible en [ThemeWagon](https://themewagon.com/themes/fruitkha-free-bootstrap-4-responsive-food-business-template/) y atribuida a **Free CSS** en su publicación.

La plantilla se adaptó a la temática de Master Martini, utilizando React y Bootstrap 5 para la implementación actual. Los recursos fotográficos y gráficos mantienen las condiciones de uso correspondientes a sus fuentes originales.

[Consultar la licencia de ThemeWagon](https://themewagon.com/license/)

## Alcance del proyecto

**Master Martini es un proyecto académico de demostración.** Los usuarios, pedidos, existencias y pagos se utilizan para probar las funcionalidades de la aplicación. El checkout no realiza cobros reales y los formularios de contacto y suscripción no envían mensajes a servicios externos.

---

<p align="center">
  <strong>Master Martini · Desarrollo Fullstack II · Duoc UC</strong>
</p>
