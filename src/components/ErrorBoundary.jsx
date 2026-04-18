import { Component } from "react";
import { C, FONT } from "../lib/theme";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100dvh",
            background: C.bg,
            color: C.t1,
            fontFamily: FONT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 480,
              background: C.s2,
              border: "1px solid " + C.b1,
              borderRadius: 20,
              padding: 32,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: C.red, marginBottom: 8 }}>
              Something broke
            </div>
            <p style={{ fontSize: 14, color: C.t3, marginBottom: 20, lineHeight: 1.6 }}>
              An unexpected error stopped the page from loading. Try refreshing.
              If this keeps happening, let us know.
            </p>
            <button
              onClick={() => {
                this.setState({ error: null });
                window.location.reload();
              }}
              style={{
                padding: "12px 28px",
                background: C.accent,
                color: C.bg,
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: 0.5,
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
