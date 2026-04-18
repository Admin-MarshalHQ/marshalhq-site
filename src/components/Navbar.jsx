import { Link, useNavigate } from "react-router-dom";
import { C, FONT_DISPLAY } from "../lib/theme";
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
        background: "rgba(8,7,11,0.85)",
        backdropFilter: "blur(24px) saturate(1.4)",
        WebkitBackdropFilter: "blur(24px) saturate(1.4)",
        borderBottom: "1px solid " + C.b1 + "66",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "nowrap",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 24,
              fontWeight: 400,
              color: C.accent,
              letterSpacing: 0,
            }}
          >
            MarshalHQ
          </div>
        </Link>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {user ? (
            <>
              <Link
                to={dashboardPath}
                style={{
                  color: C.t3,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "8px 14px",
                  borderRadius: 8,
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = C.t1)}
                onMouseLeave={(e) => (e.target.style.color = C.t3)}
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
                    padding: "8px 14px",
                    borderRadius: 8,
                    transition: "color .2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = C.t1)}
                  onMouseLeave={(e) => (e.target.style.color = C.t3)}
                >
                  Profile
                </Link>
              )}
              <button
                onClick={handleSignOut}
                style={{
                  background: "transparent",
                  color: C.t4,
                  border: "1px solid " + C.b1,
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: 0.5,
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => { e.target.style.borderColor = C.b2; e.target.style.color = C.t2; }}
                onMouseLeave={(e) => { e.target.style.borderColor = C.b1; e.target.style.color = C.t4; }}
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
                  padding: "8px 14px",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = C.t1)}
                onMouseLeave={(e) => (e.target.style.color = C.t3)}
              >
                Log In
              </Link>
              <Link
                to="/login?mode=signup"
                className="cta-btn"
                style={{
                  background: C.accent,
                  color: C.bg,
                  border: "none",
                  padding: "9px 22px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 0.5,
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
