import DOMPurify from "dompurify";

const PERMITIDAS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "h2", "h3", "ul", "ol", "li",
  "blockquote", "hr", "a", "code", "pre",
];

let gancho = false;
function prepararGancho() {
  if (gancho) return;
  gancho = true;
  // Los enlaces externos se abren en pestaña nueva sin dar acceso a la página.
  DOMPurify.addHook("afterSanitizeAttributes", (nodo) => {
    if (nodo.tagName === "A" && nodo.getAttribute("href")) {
      nodo.setAttribute("rel", "noopener noreferrer");
      if (/^https?:/i.test(nodo.getAttribute("href"))) nodo.setAttribute("target", "_blank");
    }
  });
}

const escapar = (t) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** El contenido antiguo era texto plano separado por líneas en blanco: lo pasamos a HTML. */
export function aHtml(contenido = "") {
  const texto = String(contenido || "").trim();
  if (!texto) return "";
  if (texto.startsWith("<")) return texto;
  return texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapar(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function limpiarHtml(html = "") {
  prepararGancho();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: PERMITIDAS,
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/(?!\/)|#)/i,
  });
}

export function esVacio(html = "") {
  const t = String(html).replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return t.length === 0 && !/<hr/i.test(html);
}

/** Separa la introducción (primer párrafo, en texto) del resto, ya saneado. */
export function dividirContenido(contenido, bajada = "") {
  const limpio = limpiarHtml(aHtml(contenido));
  const doc = new DOMParser().parseFromString(`<body>${limpio}</body>`, "text/html");
  const bloques = [...doc.body.children];
  let intro = bajada;
  if (bloques[0]?.tagName === "P" && bloques[0].textContent.trim()) {
    intro = bloques.shift().textContent.trim();
  }
  const cuerpo = bloques.map((b) => b.outerHTML).join("");
  return { intro, cuerpoHtml: cuerpo || `<p>${escapar(intro)}</p>` };
}
