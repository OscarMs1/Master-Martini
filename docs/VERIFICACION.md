# Comprobación técnica de Master Martini

## Antes de empezar

Preparar el archivo privado `.env`, iniciar Docker Desktop y ejecutar desde la raíz:

```powershell
docker compose up -d --build
docker compose ps
```

La compilación Docker ejecuta `mvn verify` en cada servicio Java 25, incluyendo las pruebas JUnit. La publicación de la aplicación se realiza a través del frontend en `127.0.0.1:8095`.

## Comprobar servicios y endpoints

```powershell
docker compose ps
docker compose logs --tail=80 auth-usuarios catalogo pedidos clases-contacto
Invoke-RestMethod http://127.0.0.1:8095/api/estado
(Invoke-RestMethod http://127.0.0.1:8095/api/productos).Count
(Invoke-RestMethod http://127.0.0.1:8095/api/clases).Count
```

El endpoint `/api/estado` confirma la API de entrada. El estado detallado se observa en los registros y en Docker Desktop. Un contenedor iniciado no garantiza por sí solo que todas las funciones de la interfaz estén correctas.

## Pruebas del frontend

Desde `frontend` y con Node.js compatible instalado:

```powershell
npm ci
npm test
npm run build
```

## Pruebas REST de integración

El script `scripts/verificar-api.py` realiza comprobaciones de registro, sesión, permisos, catálogo, creación de pedidos, stock, inscripción y contactos. Toma la contraseña del administrador desde el `.env` local; no registra ni muestra la clave. Para ejecutarlo en una **base de pruebas**:

```powershell
python scripts/verificar-api.py
```

**Atención:** crea usuarios, contactos, pedidos y productos de prueba y modifica existencias. No debe usarse contra una base real ni para preparar una demostración que deba permanecer sin datos ficticios.

## Qué comprobar manualmente

- Inicio y navegación entre páginas, escritorio y móvil.
- Sesión, cierre de sesión y panel de administración.
- Carrito, pago simulado aprobado/rechazado y stock restante.
- Cupos, inscripción duplicada, historial y mensajes de contacto.
- Reinicio de `auth-usuarios` y de `pedidos` sin perder datos.
- Persistencia de imágenes subidas y recuperación tras una interrupción.

No se documentan resultados como aprobados hasta ejecutarlos en la instalación de destino. No utilizar `docker compose down -v` si se necesita conservar información.

## Si el frontend abre pero muestra que el servidor no responde

La página puede cargarse aunque el microservicio de entrada todavía no haya arrancado.
Comprueba los contenedores y el mensaje original de la excepción, no solo la última parte de la traza:

```powershell
docker compose ps
docker compose logs --tail=150 auth-usuarios
```

La cuenta inicial del administrador se crea únicamente cuando no existe. Se necesitan
`ADMIN_EMAIL` y una `ADMIN_PASSWORD` de al menos 12 caracteres con letras y números
(máximo de 72 bytes UTF-8). El proceso no actualiza contraseñas de usuarios existentes.

Si se modifica el código, reconstruye el servicio afectado sin borrar los volúmenes:

```powershell
docker compose up -d --build auth-usuarios
docker compose ps
```

Si el servicio continúa reiniciándose, revisa la línea `Caused by:` del registro y su
mensaje SQL antes de modificar otros servicios. **No elimines el volumen `mysql_data`**
para solucionar un problema de arranque.
