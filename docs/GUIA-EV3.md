# Guía de defensa EV3

## Arquitectura
React → proxy Vite `/api` → controladores Spring REST → servicios transaccionales → repositorios JPA → MySQL.
El navegador no decide precios ni permisos. BCrypt (coste 12) protege contraseñas; sesión HttpOnly, SameSite Lax y CSRF protegen las operaciones. CLIENTE y ADMINISTRADOR tienen permisos diferentes.

## Demostración
1. IL3.1: crear un producto de prueba y un cliente; reiniciar servicios y consultar los mismos IDs en MySQL/API.
2. IL3.2: administrador crea, lista, edita y elimina un producto temporal. Subir JPG/PNG/WEBP, comprobar vista previa y persistencia. Comprar con pago simulado y mostrar pedido y reducción de stock.
3. IL3.3: registrar cliente, iniciar sesión, inscribirse y repetir inscripción (rechazo). Intentar acceder a `/api/admin/usuarios` con cliente (403); cerrar sesión y comprobar 401.
4. Mostrar pruebas Vitest, JUnit y `scripts/verificar-api.py`. Explicar bloqueo pesimista para stock/cupos y requestKey para evitar pedidos duplicados.

## Endpoints
- GET /api/productos, /api/productos/{id}, /api/clases, /api/novedades.
- POST /api/auth/registro, /api/auth/login, /api/auth/logout; GET /api/auth/me, /api/auth/csrf.
- POST/PUT/DELETE /api/productos (PUT/DELETE con /{id}): administrador.
- POST /api/pedidos; GET /api/pedidos/mis-pedidos.
- POST /api/inscripciones; GET /api/inscripciones/mis-inscripciones.
- POST /api/contactos; GET /api/admin/contactos.
- POST /api/admin/imagenes; GET /api/imagenes/{archivo}.
- GET /api/admin/usuarios, /api/admin/pedidos, /api/admin/inscripciones, /api/admin/novedades.

## Límites
Pago y agenda académicos; sin cobros ni correos reales. El esquema usa Hibernate update para desarrollo, no migraciones de producción. No existe recuperación de contraseña. Para publicación HTTPS, configurar COOKIE_SECURE=true y origen CORS exacto. El autor/licencia de la portada suministrada en el ZIP no está verificado: se conserva por solicitud, sin atribuirla falsamente a Unsplash. Las otras fotografías tienen fuentes documentadas.
