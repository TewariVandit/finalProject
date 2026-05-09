import { Navigate } from "react-router-dom";
import Loader from "components/Loader";
import { useAuth } from "context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) return <Loader />;

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
