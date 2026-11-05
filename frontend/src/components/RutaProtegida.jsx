import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function RutaProtegida({ admin = false, children }) {
  const { user, loading } = useAuth(),
    location = useLocation();
  if (loading)
    return (
      <div className="state-box" role="status">
        Verificando sesión…
      </div>
    );
  if (!user)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (admin && user.rol !== "ADMINISTRADOR")
    return (
      <div className="container section" role="alert">
        <h1>Acceso restringido</h1>
        <p>Esta sección está disponible para administradores.</p>
      </div>
    );
  return children;
}
