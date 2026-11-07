# Funcionalidades para la revisión del proyecto

La aplicación contiene un frontend React que consume operaciones REST de cuatro aplicaciones Spring Boot con MySQL. Las siguientes comprobaciones sirven para demostrar el funcionamiento del caso académico.

## Navegación y catálogo

1. Abrir `http://127.0.0.1:8095` y recorrer el inicio, el catálogo y las ofertas.
2. Probar las categorías, la ficha de un producto, el descuento y los indicadores de stock.
3. Consultar novedades y clases desde sus páginas públicas.
4. Comprobar que la presentación se adapta a distintos tamaños de pantalla.

## Cuenta y compra simulada

1. Registrar un cliente con datos válidos y comprobar las validaciones.
2. Iniciar sesión y modificar los datos permitidos de la cuenta.
3. Agregar productos al carrito y completar una compra simulada.
4. Abrir el historial y confirmar que se registró el pedido.
5. Comprobar rechazo por falta de stock, rechazo de pagos simulados y prevención de envío repetido.
6. Consultar la inscripción a clases y comprobar que los cupos se reducen correctamente.

## Administración y seguridad

1. Acceder con un usuario administrador y visualizar el panel.
2. Crear o modificar un producto, cambiar su disponibilidad y revisar los pedidos.
3. Gestionar una novedad y consultar las inscripciones y los contactos recibidos.
4. Confirmar que un cliente normal no tiene acceso a operaciones administrativas.
5. Detener y reiniciar contenedores sin eliminar los volúmenes; los datos deben permanecer.

**Importante:** las compras y clases forman parte de una simulación académica; no existe cobro real, despacho físico ni inscripción en un establecimiento oficial.

Para las pruebas automatizadas y la estructura de servicios, consultar `VERIFICACION.md` y `ARQUITECTURA_MICROSERVICIOS.md`.
