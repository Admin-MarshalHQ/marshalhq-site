import { C } from "../lib/theme";

const wrap = {
  padding: 40,
  background: C.s2,
  borderRadius: 20,
  border: "1px solid " + C.b1,
  textAlign: "center",
};

export function Loading({ label = "Loading..." }) {
  return (
    <div style={{ textAlign: "center", padding: 40, color: C.t3, fontSize: 14 }}>
      {label}
    </div>
  );
}

export function Empty({ title, hint }) {
  return (
    <div style={wrap}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.t2 }}>{title}</div>
      {hint && (
        <p style={{ fontSize: 13, color: C.t4, marginTop: 6 }}>{hint}</p>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{ ...wrap, borderColor: C.red + "44" }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.red, marginBottom: 6 }}>
        Something went wrong
      </div>
      <p style={{ fontSize: 13, color: C.t3, marginBottom: onRetry ? 16 : 0 }}>
        {message || "Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "10px 20px",
            background: "transparent",
            color: C.accent,
            border: "1px solid " + C.accent + "66",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
