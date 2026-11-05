# ERS vigente — Master Martini 2.0

Sistema académico para clientes y administradores. React consume REST Spring Boot con persistencia MySQL.

## Requisitos funcionales
RF1: catálogo público, filtros, ofertas y detalle con fotografías locales.
RF2: registro validado por correo y RUN; login y logout mediante sesión.
RF3: cliente agrega y retira productos, compra con pago simulado y consulta pedidos propios. Servidor recalcula precios y controla stock transaccionalmente.
RF4: inscripción autenticada a clases, control de cupos y rechazo de duplicados.
RF5: administrador crea, edita y elimina productos, sube imágenes y consulta pedidos, usuarios e inscripciones.
RF6: contacto persistente y novedades editoriales.

## Requisitos no funcionales
BCrypt, cookies HttpOnly, CSRF y autorización por roles. No aceptar precios ni cantidades negativas. Imágenes validadas por contenido y tamaño; archivos persistentes fuera del JAR. Responsive y reducción de movimiento. Navbar fija única y tarjetas 4:3.

## Trazabilidad
IL3.1: JPA/MySQL y evidencia de reinicio. IL3.2: controladores REST y pruebas funcionales. IL3.3: Spring Security y pruebas de autorización/CSRF. Consultar GUIA-EV3.md para endpoints, VERIFICACION.md para comandos de prueba y README para la instalación.
