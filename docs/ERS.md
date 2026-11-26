# Especificación de requisitos de software (ERS) — Master Martini

Versión 1.0 · 26 de noviembre de 2026

## 1. Introducción

### 1.1 Propósito

Este documento describe, de forma simple, **qué debe hacer** la aplicación web Master Martini y bajo qué condiciones. Sirve como referencia para el desarrollo, la revisión académica y las pruebas.

### 1.2 Alcance

Master Martini es un sitio web de demostración académica para una empresa de ingredientes de pastelería, panadería, chocolatería y heladería. Permite:

- ver un catálogo de productos y sus ofertas,
- crear una cuenta y hacer una **compra simulada**,
- inscribirse en clases,
- consultar a un **asistente virtual (chatbot)**,
- administrar el contenido desde un panel restringido.

No procesa pagos reales ni despacha pedidos. No está afiliado comercialmente a Master Martini Chile.

### 1.3 Definiciones

| Término | Significado |
| --- | --- |
| Visitante | Persona que navega sin iniciar sesión |
| Cliente | Usuario registrado con rol `CLIENTE` |
| Administrador | Usuario con rol `ADMINISTRADOR` |
| Compra simulada | Pedido que se registra y descuenta stock, sin cobro real |
| Asistente / chatbot | Ayudante "Martini", que responde con el modelo Claude de Anthropic |
| Cupo | Lugar disponible en una clase |

## 2. Descripción general

### 2.1 Usuarios

| Usuario | Qué puede hacer |
| --- | --- |
| Visitante | Ver catálogo, ofertas, clases y novedades; usar el chatbot; escribir por contacto; comprar como invitado |
| Cliente | Todo lo anterior, más perfil, direcciones, favoritos, reseñas, inscripciones e historial de pedidos |
| Administrador | Gestionar productos y novedades; consultar usuarios, pedidos, inscripciones, contactos y estadísticas del chatbot |

### 2.2 Entorno de ejecución

- **Local:** Docker Compose (frontend, cuatro microservicios Spring Boot y MySQL).
- **AWS Academy Learner Lab:** una instancia EC2 con Docker Compose y un bucket S3 para imágenes y videos. Ver [`DESPLIEGUE-AWS.md`](DESPLIEGUE-AWS.md).

### 2.3 Restricciones y supuestos

- En el Learner Lab no se puede crear CloudFront, así que el sitio se publica por **HTTP**, sin HTTPS. Una app de teléfono que exija HTTPS no podría conectarse a esa instalación.
- Los créditos del laboratorio son limitados y la sesión dura unas 4 horas; la EC2 se apaga al terminar.
- El chatbot necesita una clave de API de Anthropic con saldo; sin ella responde que no está disponible.

## 3. Requisitos funcionales

| ID | Requisito | Actor |
| --- | --- | --- |
| RF-01 | Mostrar el catálogo con categorías, filtros, fotografías, precio, descuento y disponibilidad | Todos |
| RF-02 | Mostrar las ofertas vigentes (productos con descuento) | Todos |
| RF-03 | Registrar cuentas validando RUN chileno (dígito verificador), teléfono, dirección y una contraseña de al menos 10 caracteres con letras y números | Visitante |
| RF-04 | Iniciar y cerrar sesión; mantener la sesión al recargar la página | Cliente, Administrador |
| RF-05 | Editar el perfil, cambiar la contraseña y guardar direcciones de entrega | Cliente |
| RF-06 | Marcar y quitar productos favoritos | Cliente |
| RF-07 | Publicar reseñas con puntuación de 1 a 5 y texto con formato; leerlas sin cuenta | Cliente, Visitante |
| RF-08 | Agregar y quitar productos del carrito | Todos |
| RF-09 | Sugerir en el carrito productos que combinan con lo elegido y clases donde se usan | Todos |
| RF-10 | Realizar una compra simulada: calcular precios en el servidor, rechazar si no hay stock, descontar stock solo si el pago simulado se aprueba y no duplicar el pedido si se reenvía | Todos |
| RF-11 | Consultar el historial de pedidos propios | Cliente |
| RF-12 | Mostrar las clases con fecha, modalidad, nivel y **cupos libres** | Todos |
| RF-13 | Inscribirse en una clase: exige sesión, no permite duplicados ni clases pasadas y respeta los cupos | Cliente |
| RF-14 | Publicar y mostrar novedades (artículos) | Todos, Administrador |
| RF-15 | Enviar mensajes por el formulario de contacto | Todos |
| RF-16 | Responder preguntas sobre productos, ofertas, clases y uso del sitio, usando solo los datos reales de la tienda | Todos |
| RF-17 | Limitar el uso del chatbot a 15 mensajes por visitante cada 10 minutos y 300 por hora en total | Sistema |
| RF-18 | Guardar las preguntas hechas al chatbot (solo texto y fecha) y borrarlas a los 90 días | Sistema |
| RF-19 | Crear, editar y eliminar productos, con su imagen | Administrador |
| RF-20 | Crear y editar novedades con un editor de texto con formato | Administrador |
| RF-21 | Consultar usuarios, pedidos, inscripciones y mensajes de contacto | Administrador |
| RF-22 | Subir imágenes y videos (MP4, WEBM o MOV de hasta 200 MB); en AWS se guardan en S3 | Administrador |
| RF-23 | Ver qué preguntan más al chatbot: totales, preguntas frecuentes, consultas por día y últimas consultas | Administrador |
| RF-24 | Ofrecer una API REST versionada (`/api/v1`) con documentación Swagger, y login por token para una app móvil | Sistema |

## 4. Requisitos no funcionales

| ID | Categoría | Requisito |
| --- | --- | --- |
| RNF-01 | Seguridad | Contraseñas guardadas con BCrypt; acceso a las funciones de administración solo con rol `ADMINISTRADOR` |
| RNF-02 | Seguridad | Token de acceso de 15 minutos guardado solo en memoria; renovación con cookie `HttpOnly` y `SameSite=Strict` de 7 días; cambiar la contraseña invalida las sesiones anteriores |
| RNF-03 | Seguridad | El inicio de sesión web solo acepta peticiones desde los orígenes permitidos (`FRONTEND_ORIGIN`); cabeceras de seguridad (CSP) en el sitio |
| RNF-04 | Seguridad | Claves, contraseñas y la clave de Anthropic viven en el archivo privado `.env`, nunca en el repositorio ni en el navegador |
| RNF-05 | Privacidad | El chatbot guarda solo el texto de la pregunta y la fecha, sin IP ni usuario |
| RNF-06 | Costo | Los límites del chatbot protegen el saldo de la cuenta de Anthropic; se usa el modelo más económico (`claude-haiku-5-5`) |
| RNF-07 | Integridad | El contenido con formato (reseñas, novedades, mensajes) se limpia para impedir scripts |
| RNF-08 | Persistencia | Los datos se guardan en MySQL con volumen persistente; sobreviven a apagar y encender la instancia |
| RNF-09 | Usabilidad | Diseño adaptable a celular y escritorio, con navegación accesible |
| RNF-10 | Mantenibilidad | Cuatro microservicios independientes con su propio esquema, y pruebas automáticas (JUnit y Vitest) |
| RNF-11 | Portabilidad | Todo el proyecto se levanta con `docker compose`, en local y en AWS |

## 5. Fuera de alcance

- Pagos reales, facturación y despacho físico de pedidos.
- HTTPS en la instalación del Learner Lab.
- Aplicación móvil nativa (la API y el login por token ya están preparados).
- Gestión de clases desde el panel de administración (las clases se cargan al iniciar el sistema).
- Respuestas del chatbot sobre pedidos puntuales, despachos o reclamos (deriva a la página de contacto).

## 6. Cómo se comprueba

- Recorrido funcional: [`GUIA-EV3.md`](GUIA-EV3.md)
- Pruebas automáticas y comprobaciones REST: [`VERIFICACION.md`](VERIFICACION.md)
- Rutas de la API y autenticación: [`API.md`](API.md)
- Seguridad: [`SEGURIDAD.md`](SEGURIDAD.md)
- Arquitectura: [`ARQUITECTURA_MICROSERVICIOS.md`](ARQUITECTURA_MICROSERVICIOS.md)
