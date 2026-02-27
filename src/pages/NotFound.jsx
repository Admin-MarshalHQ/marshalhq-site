import { Link } from "react-router-dom";
import { C, FONT } from "../lib/theme";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        padding: 20,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 440, width: "100%" }}>
        <div style={{ fontSize: 72, marginBottom: 12 }}>{"\ud83d\udd76\ufe0f"}</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: C.t1, marginBottom: 8 }}>
          404
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.t2, marginBottom: 8 }}>
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
            background: "linear-gradient(135deg,#6366f1,#4f46e5)",
            color: "#fff",
            border: "none",
            padding: "14px 28px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 20px #6366f144",
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
