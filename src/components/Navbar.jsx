import { Link, useNavigate } from "react-router-dom";
import { C } from "../lib/theme";
import { useAuth } from "../lib/AuthContext";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const dashboardPath = profile?.role === "manager" ? "/manager/dashboard" : "/marshal/dashboard";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "#050508dd",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #22223044",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: -1,
              background: "linear-gradient(135deg,#6366f1,#818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            MarshalHQ
          </div>
        </Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {user ? (
            <>
              <Link
                to={dashboardPath}
                style={{
                  color: C.t3,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "6px 12px",
                }}
              >
                Dashboard
              </Link>
              {profile?.role === "marshal" && (
                <Link
                  to="/marshal/profile"
                  style={{
                    color: C.t3,
                    textDecoration: "none",
                    fontSize: 13,
                    fontWeight: 500,
                    padding: "6px 12px",
                  }}
                >
                  Profile
                </Link>
              )}
              <button
                onClick={handleSignOut}
                style={{
                  background: "transparent",
                  color: C.t3,
                  border: "1px solid " + C.b1,
                  padding: "8px 16px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: C.t3,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "6px 12px",
                }}
              >
                Log In
              </Link>
              <Link
                to="/login?mode=signup"
                className="cta-btn"
                style={{
                  background: C.accent,
                  color: "#fff",
                  border: "none",
                  padding: "9px 20px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "none",
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
