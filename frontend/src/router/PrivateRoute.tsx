import { Navigate } from "react-router-dom";
import Header from "../components/layout/Header";
import { useAuth } from "../context/auth/useAuth";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const {
    state: { loading, user },
  } = useAuth();

  if (loading)
    return (
      <div role="status" aria-live="polite" aria-label="Cargando">
        Cargando...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen dark:main-bg">
      <Header />
      {children}
    </div>
  );
}
