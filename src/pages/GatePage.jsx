import { useState } from "react";
import { C, FONT } from "../lib/theme";

const ADMIN_PASSWORD = import.meta.env.VITE_DEV_PASSWORD || "marshalhq2026";

export default function GatePage({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [wrong, setWrong] = useState(false);

  const check = () => {
    if (pw === ADMIN_PASSWORD) {
      onUnlock();
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 2000);
    }
  };

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
      <div style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: -2,
            background: "linear-gradient(135deg,#6366f1,#818cf8,#c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 8,
          }}
        >
          MarshalHQ
        </div>
        <div style={{ fontSize: 14, color: C.t3, marginBottom: 32 }}>
          This site is currently in development
        </div>
        <div
          style={{
            background: C.s2,
            borderRadius: 20,
            padding: 32,
            border: "1px solid " + C.b1,
            textAlign: "left",
          }}
        >
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.t3,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 8,
              display: "block",
            }}
          >
            Enter password to continue
          </label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") check();
            }}
            placeholder="Password"
            style={{
              width: "100%",
              padding: "13px 16px",
              background: C.s3,
              border: "1px solid " + (wrong ? C.red : C.b1),
              borderRadius: 12,
              color: C.t1,
              fontSize: 14,
              fontFamily: "inherit",
              boxSizing: "border-box",
              marginBottom: 14,
              outline: "none",
            }}
          />
          {wrong && (
            <div style={{ fontSize: 13, color: C.red, marginBottom: 10, textAlign: "center" }}>
              Incorrect password
            </div>
          )}
          <button
            onClick={check}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg,#6366f1,#4f46e5)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign In
          </button>
        </div>
        <div style={{ fontSize: 12, color: C.t4, marginTop: 20 }}>Authorised access only</div>
      </div>
    </div>
  );
}
