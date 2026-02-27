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
        fontSize: 12,
        fontWeight: 700,
        color: C.accent,
        textTransform: "uppercase",
        letterSpacing: 2,
        marginBottom: 12,
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
        fontSize: "clamp(28px, 4vw, 42px)",
        fontWeight: 900,
        color: C.t1,
        lineHeight: 1.15,
        letterSpacing: -1,
        margin: "0 0 16px",
      }}
    >
      {children}
    </h2>
  );
}
