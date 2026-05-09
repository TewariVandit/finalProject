import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";

export default function AdminOnlyRoute({ children }) {
  const { admin } = useAuth();

  if (admin?.role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
