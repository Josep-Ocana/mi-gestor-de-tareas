import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const {
    state: { loading, user },
  } = useAuth();
  // Está cargando: muestra un spinner o texto provisional
  if (loading) return <div>Cargando...</div>;

  // No hay usuario: redirige al login
  if (!user) return <Navigate to="/login" replace />;

  // Hay usuario: muestra el contenido
  return <>{children}</>;
}
