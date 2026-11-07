# Arquitectura de Master Martini

## Estructura vigente

```text
Navegador → React / Nginx (127.0.0.1:8095)
                  │ /api/*
                  ▼
             auth-usuarios ──────────────── MySQL / mm_auth
             (sesión, CSRF, autorización,
              usuarios y puerta de entrada)
                  │
      ┌───────────┼─────────────────┐
      ▼           ▼                 ▼
   catalogo     pedidos       clases-contacto
   mm_catalog   mm_orders      mm_classes
      │           │                 │
      └───────────┴───── consulta de productos
                  │
               MySQL 8.4
```

Las llamadas internas no se publican fuera de la red Docker. Los puertos 8080 son internos; solo el frontend se expone en `127.0.0.1:8095`. Cada microservicio es una aplicación Spring Boot 3.5.16 compilada y ejecutada con Java 25. El módulo `common` es una biblioteca compartida, **no** un quinto microservicio.

## Responsabilidades

| Aplicación | Datos y operaciones |
| --- | --- |
| `auth-usuarios` | Usuarios, contraseñas cifradas, roles, sesiones, direcciones y distribución de las rutas públicas |
| `catalogo` | Productos, inventario, ofertas, novedades, fotografías subidas, favoritos, reseñas y reservas idempotentes de existencias |
| `pedidos` | Pedidos, líneas, estado del pago simulado, historial y registro recuperable de solicitudes pendientes |
| `clases-contacto` | Talleres, cupos, inscripción por usuario y mensajes de contacto |

Los cuatro esquemas MySQL son `mm_auth`, `mm_catalog`, `mm_orders` y `mm_classes`; se crean mediante `infra/init-databases.sh`. No se abre el puerto de la base hacia la máquina anfitriona.

## Operaciones entre servicios

- El frontend mantiene rutas `/api/...`; `auth-usuarios` valida las sesiones y remite la operación autorizada al servicio responsable.
- Las peticiones internas utilizan la clave compartida `SERVICE_KEY`, almacenada en el archivo privado `.env`. No se envían claves internas al navegador.
- Para una compra aprobada, `pedidos` registra la solicitud pendiente y solicita a `catalogo` la reserva de stock con una clave idempotente. Después guarda el pedido. Ante un corte, el proceso de recuperación vuelve a intentar la operación sin reservar dos veces por la misma clave.
- Las inscripciones verifican duplicados, fecha y cupos y bloquean la clase en una transacción de su propio servicio.
- Las imágenes subidas a través del catálogo se guardan fuera del JAR en un volumen Docker persistente.

## Seguridad y persistencia

- Contraseñas de usuario protegidas con BCrypt, cookies HttpOnly, CSRF y roles para las funciones administrativas.
- Contraseñas de MySQL por esquema y clave de comunicaciones fuera del código fuente.
- Esquema de sesiones JDBC creado de forma idempotente; las sesiones se conservan al reiniciar `auth-usuarios` mientras no expire la sesión y se mantenga el volumen.
- MySQL almacena sus datos en el volumen persistente `mysql_data`. Al detener los contenedores sin eliminar los volúmenes, se conservan los registros y las cuentas.

## Alcance

Docker Compose es el entorno local de ejecución. La aplicación no incluye por ahora infraestructura de despliegue en la nube; se definirá cuando exista un requerimiento académico formal.
