# Master Martini

**Aplicación web fullstack | Evaluación 3 · Ingeniería Informática**

Proyecto académico desarrollado con React, Vite, Spring Boot y MySQL. Integra un catálogo gastronómico, detalle de productos, ofertas, carrito, compra simulada, clases, novedades, contacto, cuentas de usuario y un panel de administración.

> **Proyecto de demostración académica, no oficial.** No está afiliado comercialmente a Master Martini Chile. No procesa pagos reales ni envía pedidos a la empresa.

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Frontend | React 19, Vite 7, React Router, Bootstrap 5 |
| Backend | Java 17+, Spring Boot 3, Spring Security, Spring Data JPA |
| Base de datos | MySQL 8 |
| Pruebas | Vitest (frontend), JUnit/Spring Boot Test (backend) |
| Construcción del backend | Maven Wrapper, incluido en el repositorio |

El frontend consulta los endpoints `/api` a través del proxy de Vite, que apunta al backend local. Los productos, clases, usuarios y pedidos se gestionan mediante el backend y MySQL.

## Funcionalidades

- Navegación por Inicio, Nosotros, Productos, Ofertas, Clases, Novedades y Contacto.
- Catálogo y fichas de productos con precios, cantidades y disponibilidad.
- Carrito de compras y proceso de pedido **simulado**, sin pasarela de pagos.
- Registro, inicio y cierre de sesión, además de un área de cuenta.
- Administración de contenidos y consultas mediante acceso restringido por rol.
- Inscripción a clases y almacenamiento de mensajes de contacto.
- Página de créditos fotográficos y documentación de fuentes.

## Estructura del proyecto

```text
master-martini/
├── frontend/                 Aplicación React y recursos visuales
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
├── backend/                  API REST de Spring Boot
│   ├── .mvn/                 Configuración de Maven Wrapper
│   ├── src/
│   ├── mvnw                   Maven Wrapper para macOS/Linux
│   ├── mvnw.cmd               Maven Wrapper para Windows
│   ├── pom.xml
│   └── .env.example           Referencia de variables, sin claves
├── docs/                     Guía técnica, verificación y fuentes
├── scripts/                  Herramientas auxiliares opcionales
└── README.md
```

**La instalación y ejecución son manuales.** No se necesitan archivos iniciadores `.bat`. `backend/mvnw.cmd` se conserva porque forma parte de Maven Wrapper, no es un iniciador personalizado.

## Requisitos previos

1. **Node.js 22.12 o superior** y npm (se recomienda Node.js 22 LTS o 24 LTS).
2. **JDK 17 o superior**, preferentemente Java 21. Debe poder ejecutarse `java` desde la terminal.
3. **MySQL 8** en ejecución (puedes utilizar el MySQL de XAMPP si está configurado correctamente).
4. Conexión a Internet durante la primera instalación para descargar dependencias npm y Maven.
5. Dos terminales para mantener frontend y backend ejecutándose por separado.

Comprueba las versiones en PowerShell:

```powershell
node --version
npm --version
java -version
```

Si un comando no se reconoce, instala la herramienta correspondiente y abre otra terminal. Maven **no necesita instalarse por separado**: el proyecto incluye Maven Wrapper.

## Instalación manual en Windows

Los pasos siguientes se realizan una sola vez por computador, salvo la ejecución de frontend y backend, que se repite cada vez que quieras usar la aplicación.

### 1. Obtener el proyecto

Descarga el ZIP desde GitHub y descomprímelo o clona el repositorio. Abre PowerShell en la carpeta `master-martini`, donde están `frontend/`, `backend/` y este README.

> Todos los comandos que indican `cd frontend` o `cd backend` parten de la carpeta raíz `master-martini`. Usa terminales separadas o vuelve a la raíz antes de cambiar de carpeta.

### 2. Iniciar MySQL y crear la base de datos

Inicia **MySQL** desde XAMPP o desde el servicio instalado. Abre phpMyAdmin o MySQL Workbench con una cuenta que tenga permisos para crear bases y usuarios, y ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS master_martini
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'master_martini'@'localhost'
  IDENTIFIED BY 'CAMBIA_ESTA_CLAVE';
CREATE USER IF NOT EXISTS 'master_martini'@'127.0.0.1'
  IDENTIFIED BY 'CAMBIA_ESTA_CLAVE';

GRANT ALL PRIVILEGES ON master_martini.*
  TO 'master_martini'@'localhost';
GRANT ALL PRIVILEGES ON master_martini.*
  TO 'master_martini'@'127.0.0.1';
FLUSH PRIVILEGES;
```

**Importante:** reemplaza `CAMBIA_ESTA_CLAVE` por una contraseña propia antes de ejecutar el SQL. Si el usuario ya existía, `CREATE USER IF NOT EXISTS` no reemplaza su contraseña: utiliza la clave existente o modifícala desde MySQL. No subas contraseñas a GitHub.

No necesitas importar manualmente un script de tablas: en esta configuración, Hibernate utiliza `ddl-auto=update` para generar o actualizar el esquema en el entorno de desarrollo. Los datos iniciales se cargan al iniciar, si `SEED_ENABLED` está habilitado (valor por defecto).

### 3. Configurar e iniciar el backend

**Terminal 1 — PowerShell**, desde `master-martini`:

```powershell
cd backend
$env:DB_URL = 'jdbc:mysql://127.0.0.1:3306/master_martini?serverTimezone=America/Santiago'
$env:DB_USER = 'master_martini'
$env:DB_PASSWORD = [System.Net.NetworkCredential]::new('', (Read-Host 'Contraseña de MySQL' -AsSecureString)).Password
$env:ADMIN_EMAIL = 'admin@gmail.com'
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', (Read-Host 'Contraseña inicial del administrador' -AsSecureString)).Password
.\mvnw.cmd spring-boot:run
```

Escribe las contraseñas en las solicitudes que aparecerán en la terminal. No se muestran en pantalla ni quedan escritas en el README.

- El backend escucha en **`http://127.0.0.1:8080`** por defecto.
- El usuario administrador se crea la primera vez **solo si** se configura `ADMIN_PASSWORD`, tiene entre 8 y 72 bytes y todavía no existe un usuario con ese correo.
- La contraseña se guarda como **hash BCrypt** en MySQL. Reiniciar el backend no la modifica si la cuenta ya existe.
- Debes configurar las variables **en la misma terminal** desde la que arrancas Spring Boot. Son variables temporales de esa sesión.
- Si MySQL utiliza otro puerto o credenciales diferentes, adapta `DB_URL`, `DB_USER` y `DB_PASSWORD`.

La plantilla `backend/.env.example` es únicamente una referencia. **Spring Boot no carga automáticamente ese archivo** con esta configuración; utiliza las variables de entorno de la terminal.

### 4. Instalar e iniciar el frontend

**Terminal 2 — PowerShell**, desde `master-martini`:

```powershell
cd frontend
npm ci
npm run dev
```

Abre en el navegador:

**http://127.0.0.1:5173**

`npm ci` instala exactamente las dependencias registradas en `package-lock.json`. Se ejecuta durante la instalación inicial y cuando cambian las dependencias. Para iniciar la aplicación después, basta con `npm run dev` en `frontend/` y el comando del backend en otra terminal.

### 5. Comprobar la aplicación

Con MySQL, backend y frontend encendidos:

1. Comprueba que carguen Inicio y el catálogo de productos.
2. Abre una ficha, revisa el carrito y el checkout simulado.
3. Prueba el registro e inicio de sesión de un cliente.
4. Inicia sesión como administrador en **`/login`**, usando el correo y la contraseña inicial configurados en el paso 3, y accede a **`/admin`**.
5. Verifica las páginas Clases, Novedades, Contacto y Créditos.

Si MySQL contiene un administrador creado anteriormente, ingresar una contraseña nueva en `ADMIN_PASSWORD` **no restablecerá la contraseña existente**.

## Ejecución en los siguientes usos

Con MySQL ya iniciado, solo debes abrir dos terminales:

- **Backend:** entra a `backend/`, configura las variables de entorno necesarias (como en el paso 3) y ejecuta `.\mvnw.cmd spring-boot:run`.
- **Frontend:** entra a `frontend/` y ejecuta `npm run dev`.

No vuelvas a crear la base de datos ni reinstales las dependencias si ya existen y no han cambiado.

## Ejecutar pruebas y compilar

Desde la carpeta raíz `master-martini`:

**Frontend:**

```powershell
cd frontend
npm run test
npm run build
npm run test:coverage
```

**Backend:** abre otra terminal en la raíz y ejecuta:

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd verify
```

`npm run build` genera la compilación de producción del frontend en `frontend/dist/`. Esta carpeta se ignora en Git; no es necesario incluirla en el repositorio. Los tests requieren las dependencias instaladas y no sustituyen una revisión visual del proyecto.

## Ejecución manual en macOS o Linux

La aplicación usa las mismas herramientas y la misma base de datos. En una terminal de `backend/`, configura `DB_URL`, `DB_USER`, `DB_PASSWORD`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` mediante `export`, y después ejecuta:

```bash
chmod +x ./mvnw
./mvnw spring-boot:run
```

En otra terminal de `frontend/`, ejecuta `npm ci` y `npm run dev`. Mantén las credenciales fuera de los archivos públicos del repositorio.

## Problemas frecuentes

| Problema | Qué revisar |
| --- | --- |
| `npm` o `node` no se reconoce | Instalar Node.js y abrir una terminal nueva. |
| `java` no se reconoce | Instalar un JDK 17+ y configurar `JAVA_HOME` y `PATH` si es necesario. |
| El backend no conecta con MySQL | Iniciar MySQL, verificar el puerto 3306 y revisar `DB_URL`, usuario, contraseña y permisos. |
| El catálogo no carga | Comprobar que Spring Boot siga abierto en el puerto 8080 y que Vite esté en el 5173. |
| El puerto 5173 o 8080 está ocupado | Cerrar el proceso anterior o identificar qué aplicación está utilizando ese puerto. |
| No se crea el administrador | Verificar `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `SEED_ENABLED` y si ya existe la cuenta en MySQL. |
| Maven Wrapper tarda en iniciar | En la primera ejecución puede descargar Maven y dependencias; requiere Internet. |
| El frontend muestra otro proyecto | Verificar que la terminal esté dentro del `frontend/` de esta copia y abrir la URL que muestra Vite. |

## Seguridad y publicación

- No subas contraseñas, credenciales reales, archivos `.env`, datos privados ni contenido de `.local/`.
- Los archivos `node_modules/`, `dist/`, `target/` y `coverage/` están excluidos del repositorio mediante `.gitignore`.
- La contraseña inicial del administrador es **solo para desarrollo local y defensa**; cámbiala por una contraseña fuerte y privada antes de un despliegue real.
- Para servir la aplicación por HTTPS, configura `COOKIE_SECURE=true`, un origen CORS apropiado y las demás medidas de seguridad necesarias para producción.
- Los pagos, despachos y actividades son parte de una simulación académica. El formulario de contacto no envía mensajes a una empresa real.

## Documentación y fuentes

- [Guía académica EV3](docs/GUIA-EV3.md): arquitectura, endpoints y recorrido de defensa.
- [Verificación](docs/VERIFICACION.md): pruebas y límites de validación.
- [Requisitos del sistema](docs/ERS-ACTUAL.md): descripción funcional.
- [Fuentes visuales](docs/FUENTES_IMAGENES.md): créditos y procedencia documentada de fotografías.
- [Auditoría de publicación](docs/AUDITORIA_GITHUB.md): limpieza y comprobaciones de la copia distribuida.

La portada actual utiliza `frontend/public/assets/images/hero-chocolate-editorial.webp`. Los créditos se encuentran también en la ruta `/creditos`. La procedencia pública original de esta composición no está verificada; por ese motivo no se asigna una atribución inventada.
