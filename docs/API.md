# API: Swagger y autenticación JWT

## Swagger UI

Con el proyecto levantado, abre:

- Local: http://localhost:8095/swagger-ui.html
- AWS: `https://dxxxx.cloudfront.net/swagger-ui.html`

Arriba a la derecha, en **"Select a definition"**, eliges el servicio: `auth-usuarios`, `catalogo`,
`pedidos` o `clases-contacto`. Todas las rutas se llaman a través del gateway.

Para probar rutas que exigen cuenta:

1. Ejecuta `POST /api/auth/token` (en `auth-usuarios`) con tu correo y contraseña.
2. Copia el `accessToken` de la respuesta.
3. Pulsa **Authorize** (el candado) y pega el token.

Para apagar Swagger, define `SWAGGER_ENABLED=false` en `.env`.

## Cómo funciona la autenticación

El proyecto no usa sesiones en el servidor. Cada petición se autentica con
`Authorization: Bearer <accessToken>`.

| | Página web | App del teléfono |
|---|---|---|
| Login | `POST /api/auth/login` | `POST /api/auth/token` |
| Access token (15 min) | En el cuerpo. La página lo guarda **solo en memoria** | En el cuerpo |
| Token de renovación (7 días) | Cookie `mm_refresh` HttpOnly que JavaScript no puede leer | En el cuerpo (`refreshToken`) |
| Renovar | `POST /api/auth/refresh` (la cookie va sola) | `POST /api/auth/refresh` con `{"refreshToken": "..."}` |
| Cerrar sesión | `POST /api/auth/logout` | `POST /api/auth/logout` con `{"refreshToken": "..."}` |

### Medidas de seguridad

- **Access token corto y solo en memoria (web):**
  - Dura 15 minutos (`JWT_MINUTOS`).
  - Nunca se guarda en `localStorage` ni en `sessionStorage`.
  - Al recargar la página, la sesión se recupera con la cookie de renovación.
- **Cookie de renovación protegida:**
  - Es `HttpOnly`, así que JavaScript no puede leerla y un script inyectado no puede robarla.
  - Es `SameSite=Strict`, así que otro sitio no puede usarla.
  - Solo viaja a `/api/auth`.
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
POST /api/auth/token
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
  1. Llama a `POST /api/auth/refresh` con `{"refreshToken": "..."}`.
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
