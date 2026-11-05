export default function Campo({
  name,
  id = `campo-${name}`,
  label,
  error,
  as = "input",
  children,
  ...props
}) {
  const Element = as;
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <Element
        id={id}
        name={name}
        className={`form-control ${error ? "is-invalid" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </Element>
      {error && (
        <div id={`${id}-error`} className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
}
