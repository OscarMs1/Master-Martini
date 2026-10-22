# Evidencias de validación - Master Martini EP2

## Pruebas frontend y compilación

Ejecución local documentada el **21 de octubre de 2026** en `RESULTADOS_VITEST_BUILD_2026-10-21.txt`:

- **Vitest 5.0.5:** 13 de 13 pruebas aprobadas (1 archivo).
- **Cobertura V8:** sentencias 38,40 %; ramas 34,83 %; funciones 37,91 %; líneas 45,54 %.
- **Vite 7.3.7:** compilación de producción correcta (2.046 módulos; 4,57 segundos).

Los porcentajes corresponden a la suite instrumentada, no al cumplimiento total del producto.
La salida de `coverage/` y `dist/` se regenera mediante los comandos del README.

## Pruebas complementarias

- `test-assets.txt`: 9/9 comprobaciones de imágenes.
- `test-node.txt`: 39/39 pruebas de lógica comercial.
- `test-api.txt`: 15/15 pruebas de integración API.
- `check-logic.txt`: 16/16 comprobaciones smoke.
- `check-syntax.txt`: comprobación de sintaxis registrada previamente.

## Evidencias de navegador

Las capturas en `browser/` y el reporte `browser-run.txt` provienen de una ejecución anterior.
Su conservación tiene fines de trazabilidad; no certifican una verificación visual reciente de los nuevos recursos.
