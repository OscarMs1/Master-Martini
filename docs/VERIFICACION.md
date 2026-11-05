# Verificación de la aplicación

## Frontend

Desde `frontend/`:

```bash
npm ci
npm run test
npm run build
```

## Backend

Con Java 17 o superior, MySQL disponible y las variables `DB_*` configuradas:

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

Los pagos y los despachos son simulados; no existe pasarela de pagos real. Los productos, clases y pedidos se almacenan en MySQL cuando la API está disponible. Para garantizar permisos, ejecutar también las pruebas JUnit de seguridad.

Los resultados históricos del proyecto original no certifican una ejecución nueva en otro equipo. Cualquier error de compilación, dependencia o configuración detectado al ejecutar debe solucionarse antes de publicar o entregar.
