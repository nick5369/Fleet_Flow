import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loader"><span className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loader"><span className="spinner" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}
