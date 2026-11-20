# Informe de pruebas de seguridad

**Fecha:** 20-11-2026
**Alcance:** instalación local (`http://localhost:8095`) con `docker compose`, usando cuentas de prueba.
**Método:** revisión de código y configuración, más 52 pruebas automatizadas de ataque contra la API y
la página. Las pruebas cubren las categorías del OWASP Top 10 que aplican a este proyecto.

## Resumen

| Resultado | Cantidad |
|---|---|
| Controles que pasan | 46 de 52 (los 6 restantes se explican abajo) |
| Vulnerabilidades encontradas y **corregidas** | 3 |
| Falsos positivos (verificados) | 2 |
| Pendientes (bajo riesgo o configuración de AWS) | 2 |
| Decisiones intencionales del alcance académico | 2 |

## Vulnerabilidades corregidas

| # | Hallazgo | Riesgo | Corrección |
|---|---|---|---|
| 1 | **Sin límite de intentos de login**: 25 contraseñas incorrectas seguidas respondían todas 401 | Alto: fuerza bruta de contraseñas | Filtro `LimiteSolicitudes`: 10 intentos cada 5 min por IP, más bloqueo de 15 min tras 10 fallos en la misma cuenta, aunque el ataque venga de muchas IP. Responde `429` con `Retry-After` |
| 2 | **Sin límite en formularios públicos**: contacto, registro y pedidos aceptaban envíos ilimitados | Medio: spam y agotamiento de stock con pedidos falsos | Límites por IP: contacto 5 cada 10 min, registro 5 por hora, pedidos e inscripciones 20 cada 10 min |
| 3 | **nginx revelaba su versión** (`Server: nginx/1.31.7`) | Bajo: facilita buscar vulnerabilidades conocidas | `server_tokens off` |

La IP del visitante se obtiene de forma segura (`IpCliente`): el cliente puede inventar valores en
`X-Forwarded-For`, pero solo se usa el que agrega nuestro propio proxy.

## Controles que pasaron

- **Autenticación y JWT:**
  - Rechaza tokens con `alg: none`, con el payload modificado para escalar a administrador o con la expiración extendida.
  - El token dura 15 minutos y no contiene contraseña ni datos personales.
  - El login responde lo mismo si el correo existe o no.
  - Las contraseñas se guardan con BCrypt (costo 12).
- **Autorización:**
  - Un cliente recibe `403` en todas las rutas `/admin/**` y al crear o borrar productos.
  - Las cabeceras internas falsas (`X-User-Role: ADMINISTRADOR`, `X-Service-Key`) no dan acceso.
  - El registro rechaza el campo `rol` (*mass assignment*).
  - Las rutas internas entre servicios (`/internal/...`) no se pueden alcanzar desde fuera.
- **IDOR (acceso a datos de otro usuario):**
  - Un usuario no puede ver ni borrar las direcciones, reseñas ni pedidos de otro.
  - Las reseñas no exponen el `usuarioId`.
- **Inyección SQL:** se probaron cargas típicas (`' OR '1'='1`, `; DROP TABLE`) en el login y en las rutas. Todas se rechazan sin errores de SQL, porque JPA usa consultas parametrizadas.
- **XSS:**
  - Una reseña con `<img src=x onerror=...>` se muestra como texto: React la escapa y no se inyecta ninguna etiqueta (verificado en el navegador).
  - El HTML enriquecido de novedades y consultas pasa por DOMPurify.
  - La CSP solo permite scripts del propio sitio.
- **Archivos:**
  - Solo un administrador puede subir imágenes.
  - Las imágenes se decodifican y se vuelven a codificar como PNG, lo que elimina scripts o contenido oculto.
  - Se valida el tamaño en píxeles antes de decodificar (defensa contra *decompression bombs*).
  - Los nombres se validan con una expresión regular (sin *path traversal*).
- **Lógica de negocio:**
  - Se rechazan cantidades de 0 o negativas.
  - El precio lo calcula el servidor; enviar `precio` da `400`.
  - No se puede comprar más que el stock.
- **Configuración:**
  - CORS rechaza otros orígenes.
  - Los errores no muestran *stack traces*.
  - Un cuerpo de 7 MB se rechaza con `413`.
  - Actuator no está instalado.
  - MySQL y los microservicios no están expuestos a internet; solo el puerto de nginx.
  - `.env` nunca se subió a git.
  - `npm audit` reporta 0 vulnerabilidades.
- **Sesión:**
  - Cookie de renovación `HttpOnly` y `SameSite=Strict`.
  - Rotación con detección de robo.
  - Verificación de `Origin`.
  - Revocación al cambiar la contraseña.
  - Detalle en [API.md](API.md).

## Falsos positivos

- `GET /api/v1/imagenes/..%2F..%2Fetc%2Fpasswd` y `GET /actuator` respondían `200`. En los dos casos es
  el `index.html` de la página (nginx normaliza la ruta y la página maneja las rutas desconocidas). No se
  entrega ningún archivo del servidor.

## Decisiones intencionales (alcance académico)

Estos dos puntos aparecen en las pruebas automáticas, pero **son intencionales** porque la página es
un proyecto académico:

- **El pago es simulado.** La página no cobra dinero real: el navegador indica si el pago se aprueba
  o se rechaza para poder mostrar ambos flujos. En un sitio comercial se reemplazaría por una
  pasarela real (Webpay, Mercado Pago o Stripe) y el servidor confirmaría el pago con ella.
- **Swagger es público** (`/swagger-ui.html`). Se mantiene activo porque forma parte de la entrega y
  se muestra en la presentación. En un sistema comercial se desactivaría con `SWAGGER_ENABLED=false`
  o quedaría solo para administradores.

## Pendientes

| # | Hallazgo | Riesgo | Recomendación |
|---|---|---|---|
| 1 | **El registro revela si un correo ya existe** (`409 Ya existe una cuenta`) | Bajo: permite saber quién tiene cuenta. El límite de 5 registros por hora lo frena | Responder siempre "Te enviamos un correo para continuar". Requiere envío de correos |
| 2 | **HSTS** no se envía en local, que funciona por `http` | Medio en AWS si no se configura | Configurarlo en CloudFront ([DESPLIEGUE-AWS.md](DESPLIEGUE-AWS.md), paso 5) |

### Mejoras para un sistema real

- **Bloqueo de cuentas:** el bloqueo de 15 minutos por cuenta frena la fuerza bruta distribuida, pero
  un atacante podría usarlo para bloquear a otro usuario a propósito. En producción conviene agregar
  CAPTCHA después de algunos fallos.
- **Límites con varias instancias:** los límites viven en memoria del gateway. Si se usan varias
  instancias, hay que moverlos a Redis o a AWS WAF.
- **Dependencias Java:** agregar el análisis de dependencias con OWASP Dependency-Check o Trivy al CI.
  No se ejecutó aquí porque requiere descargar herramientas adicionales.
- **MFA** para las cuentas de administrador.

## Cómo repetir las pruebas

Los tests automáticos de seguridad corren con cada build (`docker compose build`):

- `JwtTest`: tokens alterados, vencidos o ajenos, y revocación.
- `AuthWebTest`: cookie segura, verificación de origen y app móvil.
- `RefreshTokenServiceTest`: rotación y robo de tokens.
- `LimiteSolicitudesTest`: fuerza bruta e IP falsificada.
- `SeguridadTest` (backend) e `InternalSecurityTest` (servicios internos): roles.
