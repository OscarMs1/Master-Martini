# Master Martini

**Aplicación web fullstack | Evaluación 3 · Ingeniería Informática**

Proyecto académico desarrollado con React, Vite, Spring Boot, Java 25 y MySQL 8.4. Integra un catálogo gastronómico, detalle de productos, ofertas, carrito con sugerencias, compra simulada, clases, novedades, contacto, cuentas de usuario, un asistente virtual (chatbot) y un panel de administración. La aplicación se ejecuta de forma integrada mediante Docker Compose, y también puede desplegarse en AWS (ver [Despliegue en AWS](#despliegue-en-aws)).

> **Proyecto de demostración académica, no oficial.** No está afiliado comercialmente a Master Martini Chile. No procesa pagos reales ni envía pedidos a la empresa.

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7, Bootstrap 5, TipTap (editor de texto) y GSAP (animaciones) |
| Backend | Java 25, Spring Boot 3.5, Spring Security, Spring Data JPA y API REST |
| Base de datos | MySQL 8.4, con esquemas separados por servicio |
| Asistente virtual | API de Claude (Anthropic), modelo `claude-haiku-5-5` |
| Contenedores | Docker Compose, Dockerfiles y Nginx |
| Nube (opcional) | AWS: EC2 para la aplicación y S3 para imágenes y videos |
| Documentación de la API | Swagger / OpenAPI en `/swagger-ui.html` |
| Pruebas | Vitest (frontend), JUnit (backend) y comprobaciones REST |
| Construcción | npm y Maven, ejecutados automáticamente durante la compilación de Docker |

El frontend consulta los endpoints `/api/v1` desde una misma dirección. Internamente, cuatro servicios Spring Boot se encargan de las cuentas, el catálogo, los pedidos y las clases. No es necesario iniciarlos por separado.

## Funcionalidades

- Navegación por Inicio, Nosotros, Productos, Ofertas, Clases, Novedades y Contacto.
- Catálogo y fichas de productos con fotografías, categorías, filtros, precios, descuentos y disponibilidad.
- Carrito con **sugerencias** de productos y clases que combinan con lo elegido, y proceso de compra **simulado**, sin pasarela de pagos; registro de pedidos e historial.
- Registro, inicio y cierre de sesión, perfil, direcciones guardadas, favoritos y reseñas con formato.
- Inscripciones a talleres con control de cupos.
- **Asistente virtual "Martini"**: responde sobre productos, ofertas, clases y uso del sitio con datos reales (ver [Asistente virtual](#asistente-virtual-chatbot)).
- Panel de administración de acceso restringido: productos, novedades (con editor de texto), imágenes y videos, y consulta de usuarios, pedidos, inscripciones, contactos y **preguntas del chatbot**.
- API REST versionada (`/api/v1`) con Swagger y login por token para una app móvil.
- Página de créditos fotográficos y documentación de fuentes.

La aplicación valida los formularios, distingue los permisos de clientes y administradores y controla las existencias al registrar pedidos de demostración.

## Estructura del proyecto

```text
master-martini/
├── frontend/                  Aplicación React y recursos visuales
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── backend/
│   └── services/              Backend Java 25
│       ├── auth-usuarios/     Cuentas, sesiones y acceso a la API
│       ├── catalogo/         Productos, inventario y novedades
│       ├── pedidos/          Compras simuladas e historial
│       ├── clases-contacto/  Talleres, inscripciones y consultas
│       ├── common/           Código compartido
│       ├── Dockerfile
│       └── pom.xml
├── infra/                     Inicialización de MySQL
├── docs/                      Documentación del proyecto
├── scripts/                   Comprobaciones REST opcionales
├── compose.yaml               Configuración de Docker Compose
├── .env.example               Plantilla de configuración, sin claves reales
└── README.md
```

Los cuatro microservicios son aplicaciones independientes. `common` es una biblioteca de apoyo, **no** un quinto servicio. Cada microservicio tiene su propio esquema en MySQL.

## Requisitos previos

1. **Docker Desktop** instalado y abierto, con Docker Compose disponible.
2. Conexión a Internet para descargar las imágenes y dependencias durante la primera compilación.
3. Un editor como Visual Studio Code y una terminal, por ejemplo PowerShell, para ejecutar los comandos.

**No es necesario instalar Java, Maven, MySQL ni Node.js por separado** para iniciar la versión completa con Docker: cada herramienta necesaria ya está contemplada en sus contenedores.

## Instalación y ejecución en Windows

### 1. Obtener el proyecto

Descarga el ZIP desde GitHub y descomprímelo o clona el repositorio. Abre PowerShell o la terminal de Visual Studio Code en `master-martini`, la carpeta donde está `compose.yaml`.

### 2. Configurar el archivo `.env` (solo la primera vez)

Desde la carpeta principal, crea una copia de `.env.example`:

```powershell
Copy-Item .env.example .env
```

Abre el nuevo archivo `.env` y completa sus variables. El siguiente contenido muestra un **ejemplo ficticio** para una instalación local nueva:

```dotenv
DB_PASSWORD=DemoMasterDb2026Aa921X
DB_ROOT_PASSWORD=DemoRootMySql2026Bb583Y
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=DemoAdmin2026Cc714Z
JWT_SECRET=DemoJwtSecret2026Ii571T8K3M9Q2W6E4R7Y1U5
SERVICE_KEY=DemoServiceKey2026Dd826W3E5K9M2N7Q4R1
AUTH_DB_PASSWORD=DemoAuthDb2026Ee137P
CATALOG_DB_PASSWORD=DemoCatalogDb2026Ff248Q
ORDERS_DB_PASSWORD=DemoOrdersDb2026Gg359R
CLASSES_DB_PASSWORD=DemoClassesDb2026Hh460S
```

Estos valores permiten configurar una **demostración local nueva**, pero son públicos y deben sustituirse por claves privadas si se comparte o despliega la aplicación. Las contraseñas de MySQL deben utilizar letras y números; la contraseña inicial del administrador debe tener al menos 12 caracteres, incluir letras y números y no superar 72 bytes. `SERVICE_KEY` también debe ser privada. `JWT_SECRET` es **obligatorio** (sin él `docker compose` no inicia), firma los tokens de sesión y debe tener al menos 32 caracteres; puedes generar uno con `openssl rand -hex 32`. Si lo cambias, todos los usuarios deben volver a iniciar sesión.

Las demás variables del archivo `.env.example` (`ANTHROPIC_API_KEY`, `S3_BUCKET`, `FRONTEND_ORIGIN`, etc.) son opcionales y se explican en la sección correspondiente.

**El archivo `.env` se mantiene privado y excluido de GitHub.** El repositorio incluye únicamente `.env.example`, sin credenciales reales. Si ya tienes una instalación funcionando, conserva su `.env`: cambiar contraseñas en una base de datos existente requiere actualizar también las cuentas de MySQL.

### 3. Primera ejecución

Con Docker Desktop abierto, desde `master-martini` ejecuta:

```powershell
docker compose up -d --build
```

Este comando construye el frontend y los cuatro microservicios, prepara MySQL y pone en marcha la aplicación. La primera vez descarga las imágenes necesarias y ejecuta las pruebas de Maven durante la construcción.

### 4. Abrir Master Martini

Una vez que los servicios estén iniciados, abre:

**http://localhost:8095**

También puedes abrirlo desde **Docker Desktop → Containers → master-martini**, haciendo clic en el enlace **`8095:8080`** del contenedor `frontend`. No es necesario memorizar la URL.

Para abrir el navegador desde PowerShell:

```powershell
start http://localhost:8095
```

### 5. Ejecución en los siguientes usos

Después de la primera instalación, con Docker Desktop abierto, basta con **un solo comando** en la carpeta del proyecto:

```powershell
docker compose up -d
```

Docker reutiliza las imágenes existentes. No necesitas abrir una terminal para React y otra para Spring Boot, ni iniciar MySQL manualmente.

Si cambiaste código o dependencias y quieres reconstruir las imágenes, utiliza `docker compose up -d --build`.

### 6. Detener y comprobar la aplicación

| Acción | Comando |
| --- | --- |
| Iniciar el proyecto | `docker compose up -d` |
| Reconstruir tras modificar código | `docker compose up -d --build` |
| Comprobar los contenedores | `docker compose ps` |
| Ver los registros recientes | `docker compose logs --tail=100` |
| Detener sin borrar la información | `docker compose down` |

**Importante:** evita `docker compose down -v` si quieres conservar los datos. La opción `-v` elimina los volúmenes del proyecto, incluidos los utilizados por MySQL.

## Administración

El acceso administrativo se realiza desde la misma pantalla de inicio de sesión (`/login`), y las funciones del panel se encuentran en `/admin`. El panel tiene siete pestañas: **productos**, **novedades**, **usuarios**, **pedidos**, **inscripciones**, **contactos** y **chatbot**.

En una instalación nueva, el correo inicial es **`admin@gmail.com`**, o el que se indique en `ADMIN_EMAIL`. La contraseña inicial se configura en `ADMIN_PASSWORD`, dentro del archivo privado `.env`. Las contraseñas de acceso no forman parte del repositorio.

La cuenta administradora se crea durante el primer inicio si no existe. **Si el administrador ya está registrado en MySQL, reiniciar Docker o modificar `ADMIN_PASSWORD` en `.env` no cambia automáticamente su contraseña.**

## Asistente virtual (chatbot)

"Martini" es un asistente de ayuda que aparece como un botón flotante en todo el sitio. Responde sobre productos, ofertas, clases y cómo usar la página, con los datos reales de la tienda, y deriva a `/contacto` lo que no puede resolver (pedidos puntuales, despachos, reclamos).

**Para activarlo:**

1. Crea una clave de API en [console.anthropic.com](https://console.anthropic.com) y agrega saldo a la cuenta.
2. Escríbela en `ANTHROPIC_API_KEY` dentro del archivo privado `.env`. **No la subas a GitHub ni la compartas.**
3. Reinicia el servicio: `docker compose up -d`.

Sin clave, el asistente responde "aún no está configurado" y el resto del sitio funciona normal. El modelo se cambia con `ASISTENTE_MODELO` (por defecto `claude-haiku-5-5`, el más económico).

**Límites para cuidar el saldo:** cada visitante puede enviar 15 mensajes cada 10 minutos (por IP), el sitio acepta 300 mensajes por hora en total y cada respuesta tiene un máximo de 1024 tokens. Cada pregunta se cobra a tu cuenta de Anthropic, por lo que conviene desactivar la recarga automática o fijar un límite de gasto en su consola.

**Preguntas guardadas:** se guarda solo el texto de la pregunta y la fecha, sin IP ni usuario, y se borran solas a los 90 días. El administrador las ve en la pestaña **Chatbot** del panel: totales, preguntas más frecuentes (las repetidas se agrupan), consultas por día y las últimas 50.

## Despliegue en AWS

El proyecto puede publicarse en el **Learner Lab de AWS Academy** con una instancia EC2 (Docker Compose) y un bucket S3 para las imágenes y videos. La guía paso a paso, con las variables necesarias y los problemas frecuentes, está en [docs/DESPLIEGUE-AWS.md](docs/DESPLIEGUE-AWS.md).

Puntos importantes:

- En el Learner Lab no se puede crear CloudFront, así que el sitio queda por **HTTP**. Una app de teléfono que exija HTTPS no podría conectarse.
- La EC2 se apaga al terminar la sesión del laboratorio. Para volver a usarla basta con encenderla: los contenedores arrancan solos y los datos se conservan.
- Define `FRONTEND_ORIGIN` con la dirección del sitio (por ejemplo `http://TU-IP`); si no, el registro y el inicio de sesión responden "Origen no permitido".

## Ejecutar pruebas y compilar

Al crear las imágenes del backend, Docker ejecuta `mvn verify` para los módulos Java. Esto compila y ejecuta las pruebas JUnit antes de generar las imágenes. La construcción del frontend ejecuta `npm ci` y `npm run build`.

Para trabajar **solo con el frontend** desde una terminal, manteniendo Docker encendido para la API, necesitas Node.js compatible con Vite 7. Desde la raíz:

```powershell
cd frontend
npm ci
npm run dev
```

La página de desarrollo se abre en **http://localhost:5173**. Su proxy `/api` se conecta a Docker por el puerto `8095`. Para ejecutar las pruebas del frontend desde `frontend/`:

```powershell
npm test
npm run build
npm run test:coverage
```

La comprobación REST adicional se encuentra en `scripts/verificar-api.py`. **Crea usuarios, pedidos, mensajes y otros datos ficticios y puede modificar existencias**, por lo que solo debe ejecutarse en una instalación de prueba. Consulta `docs/VERIFICACION.md` para las instrucciones.

## Problemas frecuentes

| Problema | Qué revisar |
| --- | --- |
| Docker no inicia | Abrir Docker Desktop y esperar a que el motor esté disponible. |
| `docker compose` no se reconoce | Comprobar la instalación de Docker Desktop y abrir una terminal nueva. |
| La página no abre en `localhost:8095` | Ejecutar `docker compose ps` y comprobar que `frontend` esté iniciado. |
| El catálogo o las clases no cargan | Revisar `docker compose logs --tail=100 auth-usuarios catalogo clases-contacto`. |
| Un microservicio se inicia y se detiene | Consultar sus registros y comprobar las variables de `.env` y la conexión con MySQL. |
| El administrador no puede iniciar sesión | Verificar su correo y contraseña original; la clave en `.env` solo se usa al crear la cuenta. |
| Modifiqué el código, pero no aparecen los cambios | Ejecutar `docker compose up -d --build` para reconstruir las imágenes. |
| Ya existe un servicio usando el puerto 8095 | Cerrar el programa que ocupa ese puerto o ajustar el mapeo en `compose.yaml`. |

## Seguridad y publicación

- Los archivos `.env`, las credenciales reales, los registros privados y los respaldos de la base de datos permanecen fuera del repositorio.
- Las dependencias y compilaciones (`node_modules/`, `dist/`, `target/`, `coverage/`) no forman parte del repositorio.
- El panel de administración está protegido por roles. Las contraseñas de usuarios se almacenan como hashes BCrypt.
- La sesión usa un token de acceso de 15 minutos (guardado solo en memoria) y una cookie de renovación `HttpOnly` de 7 días. Detalles en [docs/SEGURIDAD.md](docs/SEGURIDAD.md) y [docs/API.md](docs/API.md).
- La ejecución local se publica únicamente en `127.0.0.1:8095`. Una publicación en Internet requiere configuración adicional de HTTPS, secretos y seguridad.
- El carrito, los pagos, las entregas y las inscripciones pertenecen a una simulación académica. No existe cobro ni despacho comercial real.

## Documentación y fuentes

- [Guía de revisión EV3](docs/GUIA-EV3.md): recorrido de las funcionalidades.
- [Arquitectura](docs/ARQUITECTURA_MICROSERVICIOS.md): organización y comunicación de los cuatro microservicios.
- [Verificación](docs/VERIFICACION.md): pruebas y comprobaciones disponibles.
- [Especificación de requisitos (ERS)](docs/ERS.md): qué debe hacer el sistema, en forma simple.
- [API y autenticación](docs/API.md): rutas `/api/v1`, Swagger, login por token y preguntas del chatbot.
- [Seguridad](docs/SEGURIDAD.md): medidas de protección del sistema.
- [Despliegue en AWS](docs/DESPLIEGUE-AWS.md): publicación en el Learner Lab.
- [Fuentes visuales](docs/FUENTES_IMAGENES.md): créditos y procedencia de los recursos.

El sitio incluye la página `/creditos`, con referencias a las fotografías utilizadas. Las marcas, logotipos y recursos visuales pertenecen a sus respectivos titulares; su inclusión en este proyecto educativo no implica afiliación oficial.
