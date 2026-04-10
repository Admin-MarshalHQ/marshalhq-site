import { Link } from "react-router-dom";
import { C, FONT_DISPLAY } from "../lib/theme";

export default function LandingNavbar() {
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
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
          <a
            href="#how"
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
            How It Works
          </a>
          <a
            href="#why"
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
            Why MarshalHQ
          </a>
          <a
            href="#waitlist"
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
            Join the Waitlist
          </a>
        </div>
      </div>
    </nav>
  );
}
