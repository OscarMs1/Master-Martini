// Datos de contacto por WhatsApp.
// El número es FICTICIO (proyecto académico): si se necesita cambiarlo, se cambia solo aquí.
export const whatsappNumber = '+56 9 0000 0000'; // como se muestra en la página
const whatsappDigits = '56900000000'; // solo números, como lo pide WhatsApp
const whatsappMessage = 'Hola Master Martini, quiero hacer una consulta.';

// Link que abre WhatsApp con el mensaje ya escrito
export const whatsappLink =
  'https://wa.me/' + whatsappDigits + '?text=' + encodeURIComponent(whatsappMessage);
