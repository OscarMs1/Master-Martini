// Si no hay acceso a la imagen oficial remota de la margarina, usa una
// fotografía local del proceso de panificación (nunca un envase de otra marca).
export function fallbackImagenProducto(event) {
  const imagen = event.currentTarget;
  if (imagen.src.includes("/Margarinas-1.jpg")) {
    imagen.onerror = null;
    imagen.src = "/assets/images/amasado.jpg";
  }
}
