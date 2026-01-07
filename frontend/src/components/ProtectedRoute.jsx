import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { useContext } from "react";

function ProtectedRoute({ children }) {
  const { accessToken, loading } = useContext(AuthContext);

  if (loading) return <div>loading...</div>;

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
