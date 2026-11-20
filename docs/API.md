# API: Swagger y autenticación JWT

## Swagger UI

Con el proyecto levantado, abre:

- Local: http://localhost:8095/swagger-ui.html
- AWS: `https://dxxxx.cloudfront.net/swagger-ui.html`

Arriba a la derecha, en **"Select a definition"**, eliges el servicio: `auth-usuarios`, `catalogo`,
`pedidos` o `clases-contacto`. Todas las rutas se llaman a través del gateway.

Para probar rutas que exigen cuenta:

1. Ejecuta `POST /api/v1/auth/token` (en `auth-usuarios`) con tu correo y contraseña.
2. Copia el `accessToken` de la respuesta.
3. Pulsa **Authorize** (el candado) y pega el token.

Para apagar Swagger, define `SWAGGER_ENABLED=false` en `.env`.

## Versionado

Todas las rutas de la API llevan la versión: `/api/v1/...`. Por ejemplo, `GET /api/v1/productos` o
`POST /api/v1/auth/login`. Si en el futuro cambia el formato de alguna respuesta, se publica
`/api/v2/...` y `/api/v1` sigue funcionando para las apps que ya están instaladas.

- Las imágenes y videos subidos antes del versionado quedaron guardados como `/api/imagenes/...` y
  `/api/videos/...`. Esas rutas siguen respondiendo, igual que las nuevas `/api/v1/imagenes/...`.
- En el frontend, la versión está definida en un solo lugar: la constante `API` de `src/services/api.js`.

## Modelo de datos

Cada microservicio tiene su propia base de datos MySQL. Dentro de cada base, las relaciones son
llaves foráneas reales mapeadas con JPA:

| Servicio | Entidad | Relación |
|---|---|---|
| catalogo | `Favorito` | N:1 con `Producto` (`@ManyToOne`, FK `favorito.producto_id`) |
| catalogo | `Resena` | N:1 con `Producto` (`@ManyToOne`, FK `resena.producto_id`) |
| clases-contacto | `Inscripcion` | N:1 con `Clase` (`@ManyToOne`, FK `inscripcion.clase_id`) |
| pedidos | `Pedido` | 1:N con sus líneas (`@ElementCollection`, tabla `pedido_lineas`) |
| auth-usuarios | `RefreshToken` | N:1 con el usuario (por email) |

Las referencias **entre microservicios**, como `usuarioId` en un pedido o `productoId` en una línea,
se guardan solo como ID. No hay llave foránea porque cada servicio tiene su propia base de datos
(*database per service*). La validez de esos IDs la comprueba el servicio dueño a través de la API.
Por ejemplo, pedidos consulta a catálogo el precio y el stock.

## Cómo funciona la autenticación

El proyecto no usa sesiones en el servidor. Cada petición se autentica con
`Authorization: Bearer <accessToken>`.

| | Página web | App del teléfono |
|---|---|---|
| Login | `POST /api/v1/auth/login` | `POST /api/v1/auth/token` |
| Access token (15 min) | En el cuerpo. La página lo guarda **solo en memoria** | En el cuerpo |
| Token de renovación (7 días) | Cookie `mm_refresh` HttpOnly que JavaScript no puede leer | En el cuerpo (`refreshToken`) |
| Renovar | `POST /api/v1/auth/refresh` (la cookie va sola) | `POST /api/v1/auth/refresh` con `{"refreshToken": "..."}` |
| Cerrar sesión | `POST /api/v1/auth/logout` | `POST /api/v1/auth/logout` con `{"refreshToken": "..."}` |

### Medidas de seguridad

- **Access token corto y solo en memoria (web):**
  - Dura 15 minutos (`JWT_MINUTOS`).
  - Nunca se guarda en `localStorage` ni en `sessionStorage`.
  - Al recargar la página, la sesión se recupera con la cookie de renovación.
- **Cookie de renovación protegida:**
  - Es `HttpOnly`, así que JavaScript no puede leerla y un script inyectado no puede robarla.
  - Es `SameSite=Strict`, así que otro sitio no puede usarla.
  - Solo viaja a `/api/v1/auth`.
  - En AWS es `Secure` (`COOKIE_SECURE=true`) y solo viaja por HTTPS.
- **Protección CSRF:**
  - Las rutas que usan la cookie (`login`, `refresh` y `logout` de la web) solo aceptan peticiones con un `Origin` incluido en `FRONTEND_ORIGIN`.
  - El resto de la API exige la cabecera `Authorization`, que el navegador nunca agrega solo, así que otro sitio no puede falsificar esas peticiones.
- **Rotación con detección de robo:**
  - Cada renovación entrega un token nuevo y deja gastado el anterior.
  - Si alguien vuelve a usar un token gastado, se asume robo y se cierran todas las sesiones que salieron de ese login.
  - Hay un margen de 30 segundos para que dos pestañas puedan renovar a la vez.
- **Tokens guardados como hash:** la base de datos solo guarda el hash SHA-256 de los tokens de renovación, nunca el token.
- **Revocación inmediata:**
  - Cambiar la contraseña invalida todos los tokens del usuario, tanto los de acceso como los de renovación.
  - El rol se lee siempre de la base de datos. Si alguien deja de ser admin, pierde el acceso al instante.
  - Una cuenta borrada no puede entrar.
- **Cabeceras de seguridad (nginx):**
  - Una CSP estricta: solo se ejecutan scripts del propio sitio.
  - `X-Frame-Options`, `nosniff` y `Referrer-Policy`.
  - Ver `frontend/nginx-seguridad.conf`.
- **Pestañas sincronizadas:** al cerrar sesión en una pestaña, las demás también la cierran.

### App móvil

```http
POST /api/v1/auth/token
Content-Type: application/json

{"email": "cliente@correo.cl", "password": "..."}
```

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "refreshToken": "q3J0...",
  "usuario": {"id": 1, "nombre": "...", "email": "...", "rol": "CLIENTE"}
}
```

- Envía `Authorization: Bearer <accessToken>` en cada petición.
- Cuando la API responda `401`:
  1. Llama a `POST /api/v1/auth/refresh` con `{"refreshToken": "..."}`.
  2. Guarda el **nuevo** `refreshToken`, porque el anterior ya no sirve.
  3. Repite la petición.
- Si la renovación también responde `401`, la app debe pedir login otra vez.
- Guarda el `refreshToken` en almacenamiento seguro: Keychain en iOS, o EncryptedSharedPreferences o
  DataStore cifrado en Android.

### Variables de `.env`

| Variable | Para qué |
|---|---|
| `JWT_SECRET` | Firma los tokens. Al menos 32 caracteres; genera uno con `openssl rand -hex 32`. Si lo cambias, todos deben volver a iniciar sesión. |
| `JWT_MINUTOS` | Duración del access token (15 por defecto). |
| `REFRESH_DIAS` | Cuántos días se recuerda la sesión sin volver a escribir la contraseña (7 por defecto). |
| `COOKIE_SECURE` | `true` en AWS (HTTPS). `false` solo en local con http. |
| `FRONTEND_ORIGIN` | Dominios desde los que la web puede iniciar sesión, separados por comas. |
