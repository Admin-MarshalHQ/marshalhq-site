import { useState } from "react";
import { C, FONT, FONT_DISPLAY } from "../lib/theme";
// FONT_DISPLAY used only for logo wordmark

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
        minHeight: "100dvh",
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
            fontFamily: FONT_DISPLAY,
            fontSize: 36,
            fontWeight: 400,
            color: C.accent,
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
            borderRadius: 16,
            padding: 32,
            border: "1px solid " + C.b1,
            textAlign: "left",
          }}
        >
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: C.t3,
              textTransform: "uppercase",
              letterSpacing: 1,
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
              borderRadius: 10,
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
              background: C.accent,
              color: C.bg,
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: 0.5,
            }}
          >
            Continue
          </button>
        </div>
        <div style={{ fontSize: 12, color: C.t4, marginTop: 20 }}>Authorised access only</div>
      </div>
    </div>
  );
}
