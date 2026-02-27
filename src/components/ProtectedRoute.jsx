import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { C, FONT } from "../lib/theme";

export default function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          color: C.t3,
          fontSize: 14,
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && profile?.role !== role) {
    const redirect = profile?.role === "manager" ? "/manager/dashboard" : "/marshal/dashboard";
    return <Navigate to={redirect} replace />;
  }

  return children;
}
