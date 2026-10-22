# Especificación de requisitos de software

Master Martini | DSY1104 - EP2 | 22 de octubre de 2026

## 1. Propósito y alcance

Master Martini es una tienda académica de insumos gastronómicos. El frontend React adapta el diseño de referencia Fruitkha y conserva el carrusel, las transiciones, fotografías y Bootstrap. El catálogo contiene 12 productos iniciales y cuatro clases. La portada vigente es public/assets/Portada.jpg. Compras, cuentas e inscripciones son simulaciones.

## 2. Actores y arquitectura

| Actor | Operaciones disponibles |
| --- | --- |
| Visitante | Catálogo, categorías, ofertas, detalle, carrito, compra simulada, información y clases. |
| Cliente demo | Cuenta, historial filtrado por correo e inscripciones del navegador. |
| Vendedor demo | Crear y editar productos; consultar pedidos y usuarios. La interfaz no ofrece eliminar. |
| Administrador demo | CRUD completo de productos y restauración del catálogo. |

App.jsx define rutas con React Router. Las páginas consumen ShopProvider; ProductCard y los formularios reciben props y callbacks. ShopContext concentra carrito, catálogo, perfil, pedidos e inscripciones. commerce.js valida datos y calcula importes; storage.js implementa lectura, escritura y CRUD. Los datos iniciales residen en src/data/.

## 3. Persistencia y API opcional

Por defecto se usa localStorage con claves mm-ep2-*. El pago aprobado registra un pedido, reduce stock y vacía el carrito; el rechazo conserva existencias y carrito. VITE_USE_BACKEND=true habilita la API Node local mediante el proxy /api. Las pruebas de integración verifican sus operaciones sin contactar servicios comerciales.

## 4. Requisitos funcionales y aceptación

| ID | Requisito | Aceptación y evidencia |
| --- | --- | --- |
| RF01-06 | Inicio, catálogo, categorías, ofertas y detalle | Tres diapositivas; búsqueda y filtros; orden por precio neto o nombre; datos desde estado. C01-C07 y E2E. |
| RF07-08 | Carrito y totales | Agregar, incrementar, disminuir, eliminar y vaciar; respetar stock; persistir tras recarga. C06, C08-C09. |
| RF09-10 | Registro y acceso | Validar RUN, correo, ubicación y confirmación de clave; perfiles demo. C14-C17. |
| RF11-13 | Checkout y resultado | Datos precargados; validación de entrega y stock; pago aprobado y rechazado. C10-C13. |
| RF14-16 | Administración e historial | Crear, buscar, editar y eliminar productos; mostrar pedidos de la cuenta. C18-C20 y E2E. |
| RF17-18 | Novedades y contacto | Artículos con ruta de detalle; validación y confirmación local de contacto. C21 y E2E. |
| RF19 | Adaptación responsive | Navegación, grillas y formularios sin desbordamiento en 390, 768, 1366 y 1920 px. E2E. |
| RF20 | Pruebas frontend | 62 casos Vitest aprobados; 44 ejercitan componentes o vistas, con props, estado, eventos y DOM. |
| RF21-22 | Restauración y persistencia | Restauración de catálogo y conservación local de los datos. Pruebas API y recargas E2E. |
| RF23-25 | Integridad y accesibilidad | Control de stock; imagen de respaldo; etiquetas, aria-invalid y mensajes asociados. C02, C10, C13, C25. |
| RF26 | Clases | Filtrar modalidad, inscribir una vez por navegador, reducir un cupo visual, agregar insumos y ver inscripción. C23-C24. |

Los casos C01-C26 están documentados en las pruebas de `src/tests/`; la suite de validación básica se encuentra en `pagina.test.jsx`. El detalle cuantitativo figura en el informe de pruebas.

## 5. Requisitos no funcionales

RNF01: conservar el diseño visual y adaptar las grillas con col-12, col-sm-6, col-md-6, col-lg-4 y col-xl-3. RNF02: usar etiquetas accesibles y errores asociados. RNF03: separar vistas, componentes, estado, datos y utilidades. RNF04: generar una compilación Vite de producción. RNF05: mantener pruebas reproducibles en Windows con Node.js y npm.

## 6. Rutas principales

| Rutas | Responsable |
| --- | --- |
| / | Home.jsx |
| /catalogo, /ofertas, /categorias/:category, /producto/:id | ShopPages.jsx |
| /carrito, /checkout, /compra-exitosa/:id, /compra-rechazada | CartCheckout.jsx |
| /login, /registro, /mi-cuenta, /admin | AccountAdmin.jsx |
| /clases | Clases.jsx |
| /nosotros, /blog, /blog/:slug, /contacto y ruta desconocida | InfoPages.jsx |

## 7. Límites del prototipo

No hay autenticación de producción, cobros, correos ni despacho real. El registro no conserva la contraseña: para un acceso posterior se usan cuentas demo. Las inscripciones y cupos son locales al navegador, no reservas multiusuario asociadas a una cuenta. La API opcional es demostrativa. Los diagramas administrativos del anexo son una propuesta: no se implementa CRUD de categorías ni de usuarios; sí CRUD de productos y consulta de usuarios y pedidos.

## 8. Referencias

Referencia académica: evaluación parcial 2 de DSY1104 y su anexo de instrucciones. Herramienta de pruebas frontend utilizada: Vitest.

Repositorio: https://github.com/OscarMs1/Master-Martini. Diseño de referencia: plantilla Fruitkha, publicada en ThemeWagon.
