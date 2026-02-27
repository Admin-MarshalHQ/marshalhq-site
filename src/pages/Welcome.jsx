import { Link } from "react-router-dom";
import { C } from "../lib/theme";

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
          background: "radial-gradient(circle, #6366f110 0%, transparent 70%)",
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
            gap: 8,
            background: "#6366f115",
            border: "1px solid #6366f133",
            borderRadius: 50,
            padding: "6px 18px",
            marginBottom: 36,
            fontSize: 13,
            color: C.accentL,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: C.green,
              animation: "pulse 2s infinite",
            }}
          />
          Coming Soon
        </div>

        {/* Logo */}
        <h1
          style={{
            fontSize: "clamp(40px, 8vw, 72px)",
            fontWeight: 900,
            letterSpacing: -2,
            lineHeight: 1,
            background: "linear-gradient(135deg, #6366f1, #818cf8, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
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
            fontWeight: 500,
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
          Stop scrolling WhatsApp groups. Start getting booked.
        </p>

        {/* CTA */}
        <Link
          to="/join"
          className="cta-btn"
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "#fff",
            padding: "18px 44px",
            borderRadius: 14,
            fontSize: 17,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 4px 24px #6366f144",
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
