import { Link } from "react-router-dom";
import { C, FONT_DISPLAY } from "../lib/theme";
// FONT_DISPLAY used only for logo wordmark

export default function Welcome() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: 24,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, " + C.accent + "08 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", textAlign: "center", maxWidth: 560 }}>
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: C.accent + "12",
            border: "1px solid " + C.accent + "33",
            borderRadius: 50,
            padding: "6px 18px",
            marginBottom: 36,
            fontSize: 12,
            color: C.accentL,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Early Access
        </div>

        {/* Logo */}
        <h1
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(44px, 9vw, 80px)",
            fontWeight: 400,
            color: C.accent,
            lineHeight: 1,
            letterSpacing: -1,
            marginBottom: 20,
          }}
        >
          MarshalHQ
        </h1>

        {/* Tagline */}
        <p
          style={{
            fontSize: "clamp(16px, 2.5vw, 22px)",
            color: C.t2,
            lineHeight: 1.5,
            fontWeight: 400,
            marginBottom: 12,
          }}
        >
          The UK's first marketplace for
          <br />
          film location marshals.
        </p>

        <p
          style={{
            fontSize: 15,
            color: C.t4,
            lineHeight: 1.6,
            marginBottom: 44,
          }}
        >
          Launching soon for the UK film and television industry.
        </p>

        {/* CTA */}
        <Link
          to="/join"
          className="cta-btn"
          style={{
            display: "inline-block",
            background: C.accent,
            color: C.bg,
            padding: "18px 44px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            letterSpacing: 0.5,
            fontFamily: "inherit",
          }}
        >
          Join the Waitlist
        </Link>

        {/* Subtle info */}
        <div
          style={{
            marginTop: 20,
            fontSize: 13,
            color: C.t4,
          }}
        >
          Early access &middot; Zero fees for 3 months
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          fontSize: 12,
          color: C.t4,
          letterSpacing: 0.3,
        }}
      >
        &copy; 2026 MarshalHQ
      </div>
    </div>
  );
}
