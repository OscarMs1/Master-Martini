# Especificación de requisitos — Master Martini

Proyecto académico de comercio electrónico simulado. La interfaz React consume una API REST con aplicaciones Spring Boot en Java 25 y persistencia MySQL 8.4.

## Requisitos funcionales

- **RF1. Catálogo:** productos por categoría, filtros, ofertas, fichas y fotografías con información de disponibilidad.
- **RF2. Cuenta:** registro validado, login, cierre de sesión, perfil, direcciones, favoritos, reseñas y actualización de contraseña.
- **RF3. Compras:** carrito y checkout de demostración, cálculo de precios en servidor, control de inventario y consulta de pedidos propios.
- **RF4. Clases:** consulta de talleres, inscripción autenticada, prevención de duplicados y control de cupos.
- **RF5. Administración:** mantenimiento de productos, imágenes y novedades; consulta de pedidos, inscripciones y mensajes mediante roles.
- **RF6. Contacto:** registro de consultas y acceso administrativo a los mensajes.

## Requisitos no funcionales

- Autenticación con BCrypt, autorización por roles, sesiones con cookies HttpOnly y protección CSRF.
- Control de existencia mediante reserva idempotente y recuperación de pedidos pendientes entre servicios.
- Persistencia de datos en MySQL y archivos subidos en volumen independiente.
- Diseño responsive, navegación accesible y carga de recursos optimizada.
- Gestión privada de contraseñas y claves de comunicación, sin publicarlas en GitHub.

## Componentes

La solución mantiene cuatro aplicaciones Spring Boot: `auth-usuarios`, `catalogo`, `pedidos` y `clases-contacto`, además de un módulo `common` que no se ejecuta como servicio. React y Nginx proporcionan la entrada web. Docker Compose organiza la ejecución local.

La comprobación de los requisitos puede realizarse con `docs/GUIA-EV3.md` y `docs/VERIFICACION.md`.
