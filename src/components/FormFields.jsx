// Campo de formulario reutilizable (label + input/select/textarea + mensaje de error).
// Props:
// - name, label: nombre del campo y texto de la etiqueta
// - error: mensaje de error (si hay)
// - as: 'input' (por defecto), 'select' o 'textarea'
// - col: clase de columna de Bootstrap, por ejemplo 'col-md-6' (opcional)
// - el resto de props (value, onChange, type...) se pasan directo al input
export function Field({ name, label, error, as = 'input', col, children, ...props }) {
  const id = 'field-' + name;
  const errorId = id + '-error';

  const inputProps = {
    id,
    name,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
    className: 'form-control' + (error ? ' is-invalid' : ''),
    ...props
  };

  let input = <input {...inputProps} />;
  if (as === 'select') input = <select {...inputProps}>{children}</select>;
  if (as === 'textarea') input = <textarea {...inputProps} />;

  return (
    <div className={col ? 'field-wrap ' + col : 'field-wrap'}>
      <label htmlFor={id}>{label}</label>
      {input}
      {error && (
        <div id={errorId} className="field-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export function Alert({ children, type = 'info' }) {
  return (
    <div role="alert" className={'inline-alert ' + type}>
      {children}
    </div>
  );
}
