import React from 'react';

/** Evita una pantalla en blanco si un componente falla mientras React está renderizando. */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[Master Martini] Error de renderizado de React:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <section
        role="alert"
        style={{
          fontFamily: 'Arial,sans-serif',
          maxWidth: 760,
          margin: '8vh auto',
          padding: 28,
          border: '1px solid #f28123',
          borderRadius: 10,
          color: '#051922',
          background: '#fff'
        }}
      >
        <h1 style={{ fontSize: 26, margin: '0 0 16px' }}>No se pudo cargar Master Martini</h1>
        <p>
          La aplicación React encontró un error. Puedes copiar el mensaje siguiente para localizar
          la causa.
        </p>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: '#fff4e8',
            padding: 15,
            borderRadius: 6
          }}
        >
          {this.state.error?.name}: {this.state.error?.message}
        </pre>
        <p style={{ fontSize: 13 }}>
          Abre la consola con <kbd>Ctrl + Shift + J</kbd> para obtener más detalles y envía la
          primera línea roja del error.
        </p>
        <button
          style={{
            border: 0,
            color: 'white',
            background: '#f28123',
            padding: '12px 20px',
            borderRadius: 5,
            cursor: 'pointer'
          }}
          onClick={() => window.location.reload()}
        >
          Recargar página
        </button>
      </section>
    );
  }
}
