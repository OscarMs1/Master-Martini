export default function Estado({ loading, error, retry, children }) {
  if (loading)
    return (
      <div className="state-box" role="status">
        <span className="spinner-border spinner-border-sm me-2" />
        Cargando…
      </div>
    );
  if (error)
    return (
      <div className="state-box" role="alert">
        <h2>No pudimos cargar la información</h2>
        <p>{error}</p>
        {retry && (
          <button className="btn btn-outline-primary" onClick={retry}>
            Volver a intentar
          </button>
        )}
      </div>
    );
  return children;
}
