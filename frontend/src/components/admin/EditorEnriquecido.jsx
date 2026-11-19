import { useEffect, useRef } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { aHtml, esVacio } from "../../utils/contenidoEnriquecido";
import "../../styles/editor-enriquecido.css";

function Boton({ activo, onClick, etiqueta, children, deshabilitado }) {
  return (
    <button
      type="button"
      className={`ee-boton ${activo ? "is-active" : ""}`}
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      aria-pressed={!!activo}
      disabled={deshabilitado}
    >
      {children}
    </button>
  );
}

/**
 * Editor de texto enriquecido (TipTap). Guarda HTML en `value`.
 * Un editor vacío se entrega como "" para que la validación "obligatorio" funcione.
 */
export default function EditorEnriquecido({ id = "campo-contenido", label, value, onChange, maxLength = 15000, clave = "", compacto = false, error = "", minAlto }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, protocols: ["http", "https", "mailto", "tel"] },
      }),
    ],
    content: aHtml(value),
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label,
        class: "ee-contenido prose",
        ...(error ? { "aria-invalid": "true", "aria-describedby": `${id}-error` } : {}),
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(esVacio(html) ? "" : html);
    },
  });

  // Solo se reemplaza el texto cuando el formulario pasa a OTRA novedad (cambia `clave`).
  // Sincronizar con cada cambio de `value` pisaba lo que el usuario estaba escribiendo.
  const claveInicial = useRef(clave);
  useEffect(() => {
    if (!editor || claveInicial.current === clave) return;
    claveInicial.current = clave;
    editor.commands.setContent(aHtml(value), { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, editor]);

  const e = useEditorState({
    editor,
    selector: ({ editor: ed }) =>
      ed && {
        negrita: ed.isActive("bold"),
        cursiva: ed.isActive("italic"),
        subrayado: ed.isActive("underline"),
        h2: ed.isActive("heading", { level: 2 }),
        h3: ed.isActive("heading", { level: 3 }),
        lista: ed.isActive("bulletList"),
        numerada: ed.isActive("orderedList"),
        cita: ed.isActive("blockquote"),
        enlace: ed.isActive("link"),
        deshacer: ed.can().undo(),
        rehacer: ed.can().redo(),
      },
  });

  if (!editor || !e) return null;
  const largo = esVacio(editor.getHTML()) ? 0 : editor.getHTML().length;

  function enlazar() {
    const previo = editor.getAttributes("link").href || "https://";
    const url = window.prompt("Dirección del enlace (déjala vacía para quitarlo)", previo);
    if (url === null) return;
    if (url.trim() === "" || url.trim() === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  const c = () => editor.chain().focus();
  return (
    <div className="mb-3 ee">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className={`ee-caja ${error ? "is-invalid" : ""}`}>
        <div className="ee-barra" role="toolbar" aria-label="Formato del texto">
          <Boton etiqueta="Negrita" activo={e.negrita} onClick={() => c().toggleBold().run()}><b>N</b></Boton>
          <Boton etiqueta="Cursiva" activo={e.cursiva} onClick={() => c().toggleItalic().run()}><i>C</i></Boton>
          {!compacto && <Boton etiqueta="Subrayado" activo={e.subrayado} onClick={() => c().toggleUnderline().run()}><u>S</u></Boton>}
          {!compacto && (
            <>
              <span className="ee-sep" aria-hidden="true" />
              <Boton etiqueta="Título" activo={e.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>H2</Boton>
              <Boton etiqueta="Subtítulo" activo={e.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>H3</Boton>
            </>
          )}
          <span className="ee-sep" aria-hidden="true" />
          <Boton etiqueta="Lista con viñetas" activo={e.lista} onClick={() => c().toggleBulletList().run()}>• Lista</Boton>
          <Boton etiqueta="Lista numerada" activo={e.numerada} onClick={() => c().toggleOrderedList().run()}>1. Lista</Boton>
          {!compacto && <Boton etiqueta="Cita" activo={e.cita} onClick={() => c().toggleBlockquote().run()}>“ ”</Boton>}
          <Boton etiqueta="Enlace" activo={e.enlace} onClick={enlazar}>Enlace</Boton>
          {!compacto && <Boton etiqueta="Línea separadora" onClick={() => c().setHorizontalRule().run()}>—</Boton>}
          <span className="ee-sep" aria-hidden="true" />
          <Boton etiqueta="Deshacer" deshabilitado={!e.deshacer} onClick={() => c().undo().run()}>↶</Boton>
          <Boton etiqueta="Rehacer" deshabilitado={!e.rehacer} onClick={() => c().redo().run()}>↷</Boton>
        </div>
        <EditorContent editor={editor} style={minAlto ? { "--ee-min": minAlto } : undefined} />
      </div>
      {error && <div id={`${id}-error`} className="invalid-feedback d-block">{error}</div>}
      <div className={`ee-contador ${largo > maxLength ? "excedido" : ""}`} aria-live="polite">
        {largo} / {maxLength} caracteres{largo > maxLength ? " — el contenido es demasiado largo" : ""}
      </div>
    </div>
  );
}
