import { C } from "../../lib/theme";

export function Section({ children, style = {}, id }) {
  return (
    <div id={id} style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", ...style }}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: C.accent,
        textTransform: "uppercase",
        letterSpacing: 3,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <h2
      style={{
        fontSize: "clamp(28px, 4vw, 44px)",
        fontWeight: 700,
        color: C.t1,
        lineHeight: 1.15,
        letterSpacing: -0.5,
        margin: "0 0 20px",
      }}
    >
      {children}
    </h2>
  );
}
