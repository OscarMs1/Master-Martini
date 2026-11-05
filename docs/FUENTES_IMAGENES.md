# Fuentes de imágenes y recursos visuales

Esta relación identifica los principales recursos utilizados en la aplicación. Los créditos visibles se encuentran en la ruta `/creditos` y enlazan a las páginas de procedencia registradas cuando están disponibles.

## Portada principal

- **Imagen de portada actual:** `frontend/public/assets/images/hero-chocolate-editorial.webp` (optimizada para la web).
- **Archivo original incluido en el proyecto:** `frontend/public/assets/images/hero-torta-fondo-final.png`, accesible desde la tarjeta de portada en `/creditos`.
- La composición procede de un recurso aportado al proyecto. **No se dispone de una URL pública de procedencia verificable** ni de una ficha de fotógrafo. Por ese motivo no se atribuye arbitrariamente a Unsplash, Pexels ni a un autor no confirmado.

## Fotografías de terceros

Las demás tarjetas de `/creditos` enlazan a las páginas de fotografías individuales en Unsplash, al recurso de Pexels para `chef-gustavo-fring.jpg` y a la fotografía oficial citada desde Master Martini Chile. Las fotografías editoriales son ilustrativas y no constituyen fotografías oficiales de los productos comercializados.

- [Licencia Unsplash](https://unsplash.com/license)
- [Licencia Pexels](https://www.pexels.com/license/)
- [Master Martini Chile](https://mastermartini.cl/)

Los archivos externos deben utilizarse respetando sus licencias y las marcas de terceros. El logotipo y los recursos oficiales pertenecen a sus respectivos titulares; el caso académico no implica afiliación con la marca.

## Criterios de mantenimiento

- Cuando se reemplace una fotografía, actualizar el archivo local y la entrada correspondiente en `frontend/src/pages/Creditos.jsx`.
- Para materiales sin procedencia pública comprobada, registrar la información verificada sin inventar enlaces ni autores.
- Mantener los recursos que están referenciados por los datos iniciales de Spring Boot y por los componentes React.
