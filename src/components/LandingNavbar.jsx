import { C } from "../lib/theme";

export default function LandingNavbar({ scrollToForm }) {
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
        borderBottom: "1px solid #22223044",
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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a
            href="#how"
            style={{
              color: C.t3,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 500,
              padding: "6px 12px",
            }}
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
              padding: "6px 12px",
            }}
          >
            Why MarshalHQ
          </a>
          <a
            href="#waitlist"
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
            Join the Waitlist
          </a>
        </div>
      </div>
    </nav>
  );
}
