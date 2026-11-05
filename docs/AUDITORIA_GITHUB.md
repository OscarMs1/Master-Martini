# Revisión de publicación en GitHub

## Alcance

Se revisaron los archivos de la aplicación React, la configuración Spring Boot, los recursos de imágenes, las páginas públicas, las rutas de créditos y la documentación incluida en esta copia del proyecto.

## Ajustes aplicados

- El enlace de la portada conduce al archivo de origen disponible en el propio proyecto; no se atribuye a una fuente pública desconocida.
- Se retiraron mensajes internos en Contacto, Nosotros, Registro y Checkout, conservando la transparencia sobre la naturaleza académica y las transacciones simuladas.
- Las descripciones iniciales de productos se sustituyeron por textos específicos y comprensibles. El proceso que migra antiguas descripciones de MySQL sigue incluido.
- Se retiraron capturas históricas, PDFs desactualizados, imágenes de portada sustituidas, dependencias instaladas y registros de validación locales del paquete.
- Se conservaron frontend, backend, archivos de configuración, pruebas existentes y scripts de Windows.
- La configuración inicial de administrador está vinculada a variables de entorno; no hay una contraseña publicada en el código.

## Comprobaciones realizadas en este entorno

- Análisis sintáctico de archivos JavaScript y JSX: 55 archivos, sin errores de parseo.
- Validación de recursos visuales: 59 imágenes, sin errores de lectura.
- Validación de JSON y XML: sin errores detectados.
- Inspección de referencias estáticas a imágenes: sin faltantes encontrados.
- Búsqueda de textos públicos impropios y referencias a asistentes en código y documentación conservados: no se encontraron las frases revisadas.

## Limitaciones

- **No se logró ejecutar `npm ci` ni las pruebas de Vitest**, porque el registro de npm no estuvo accesible desde este entorno (`EAI_AGAIN`).
- **No se ejecutaron las pruebas JUnit ni la aplicación completa**: se requiere Maven/dependencias y una instancia de MySQL.
- La revisión estática no sustituye una prueba visual real en navegador ni las pruebas de integración.
- No se ha verificado una URL pública original para la imagen editorial de portada; se vincula al PNG aportado en el ZIP.
- Esta entrega es una limpieza para repositorio; no implica la implementación de una arquitectura de microservicios ni del rediseño responsive solicitado en otro encargo.

Para completar la revisión en Windows: seguir la instalación manual del [README](../README.md), iniciar MySQL, ejecutar las pruebas desde las terminales y comprobar visualmente las rutas principales en 390, 768 y 1440 píxeles.
