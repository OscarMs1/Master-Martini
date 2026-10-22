# Evidencias de pruebas

22 de octubre de 2026. Vitest: 62/62 (44 casos de componentes/vistas, nueve de hook y nueve de funciones/datos/almacenamiento). Node: 39/39. Recursos: 9/9. API: 15/15. Smoke: 16/16. E2E local: 16/16. E2E con API real: 5/5. Sintaxis y build correctos.

Cobertura final: líneas 97,56 %, sentencias 95,28 %, funciones 96,60 %, ramas 90,55 %. Umbrales entregados: 95 % en líneas/sentencias/funciones y 90 % en ramas.

- validate-all.txt: ejecución agregada, también desglosada en registros por comando.
- coverage-summary.json: medición final; previous-review-coverage.json: medición intermedia (74,86 % de líneas).
- baseline-coverage.*: medición base (45,54 % de líneas).
- baseline-full-scope*: medición base con alcance completo (25 % de líneas). La medición final incorpora dos líneas adicionales instrumentadas; el alcance de archivos se mantiene.
- browser/: capturas y resultados de 16 escenarios locales.
- backend-browser/: cinco escenarios con API real y datos temporales aislados.
- backend-browser-run.txt: ECONNREFUSED es esperado en B05, donde se apaga deliberadamente la API para comprobar el mensaje de error.
- coverage-gate-check.txt: rechazo ESPERADO (código 1) al exigir 100 % de líneas por CLI; confirma que el control de calidad falla ante un umbral incumplido. No representa un fallo de la suite ni de los umbrales entregados.
- validation.json: resultados de comandos y separación de la prueba negativa del umbral.

GitHub Actions está configurado en .github/workflows/quality.yml, pero no se ha ejecutado remotamente ni se ha publicado el código. Las pruebas locales y sus evidencias sí se ejecutaron.
