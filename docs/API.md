# API: Swagger y autenticación

## Swagger UI

Con el proyecto levantado, abre:

- Local: http://localhost:8095/swagger-ui.html
- AWS: `https://dxxxx.cloudfront.net/swagger-ui.html`

Arriba a la derecha, el selector **"Select a definition"** cambia de servicio: `auth-usuarios`,
`catalogo`, `pedidos` y `clases-contacto`. Todas las rutas se llaman a través del gateway, así que
puedes probarlas desde ahí mismo con **Try it out**.

Para probar rutas que exigen cuenta:

1. Abre `POST /api/auth/token` (en `auth-usuarios`), pulsa **Try it out** y envía tu correo y contraseña.
2. Copia el `accessToken` de la respuesta.
3. Pulsa **Authorize** (el candado) y pega el token. Desde ese momento, Swagger lo envía en cada petición.

Para apagar Swagger, por ejemplo en producción, define `SWAGGER_ENABLED=false` en `.env` y reinicia
con `docker compose up -d`.

## Dos formas de iniciar sesión

| Cliente | Login | Cómo se autentica cada petición |
|---|---|---|
| Página web | `POST /api/auth/login` | Cookie `JSESSIONID` y cabecera CSRF en POST, PUT y DELETE. No cambió nada. |
| App del teléfono | `POST /api/auth/token` | Cabecera `Authorization: Bearer <token>`. No usa cookies ni CSRF. |

### App móvil (JWT)

```http
POST /api/auth/token
Content-Type: application/json

{"email": "cliente@correo.cl", "password": "..."}
```

Respuesta:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "usuario": {"id": 1, "nombre": "...", "email": "...", "rol": "CLIENTE"}
}
```

Después, en cada petición:

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

Detalles:

- **Duración:** el token dura `JWT_MINUTOS`, que por defecto son 60 minutos. Cuando la API responde `401`, la app
  debe volver a pedir el token con `POST /api/auth/token`. Guárdalo en almacenamiento seguro:
  Keychain en iOS, EncryptedSharedPreferences o DataStore cifrado en Android.
- **Cerrar sesión:** la app borra el token. No se llama a `/api/auth/logout`.
- **Revocación:**
  - Si el usuario cambia su contraseña o se elimina su cuenta, sus tokens dejan de valer de inmediato.
  - El rol (cliente o administrador) se lee siempre de la base de datos, no del token.
- **Firma:** los tokens se firman con `JWT_SECRET`, definido en `.env` con al menos 32 caracteres.
  Genera uno con `openssl rand -hex 32`. Si lo cambias, todos los tokens emitidos dejan de valer.
- **Rutas públicas:** las que no exigen cuenta (catálogo, imágenes, videos) funcionan sin token.
