import { Link } from "react-router-dom";
import { C, FONT } from "../lib/theme";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        padding: 20,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 440, width: "100%" }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: C.accent,
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          404
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.t2, marginBottom: 8 }}>
          Page not found
        </div>
        <p style={{ fontSize: 14, color: C.t3, lineHeight: 1.6, marginBottom: 28 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="cta-btn"
          style={{
            display: "inline-block",
            background: C.accent,
            color: C.bg,
            border: "none",
            padding: "14px 28px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            letterSpacing: 0.5,
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
