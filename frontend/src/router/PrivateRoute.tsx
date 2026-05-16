import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth/useAuth";
import Header from "../components/layout/Header";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const {
    state: { loading, user },
  } = useAuth();

  if (loading) return <div role="status" aria-live="polite" aria-label="Cargando">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen dark:bg-gray-900">
      <Header />
      {children}
    </div>
  );
}
