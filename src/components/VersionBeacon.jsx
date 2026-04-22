import { useState } from "react";
import { BUILD_INFO, formatBuildTime } from "../lib/buildInfo";
import { C } from "../lib/theme";

function InfoRow({ label, value, mono = false }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "68px 1fr",
        gap: 10,
        alignItems: "start",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: C.t4,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          color: C.t2,
          fontFamily: mono ? "'Consolas','SFMono-Regular',monospace" : "inherit",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function VersionBeacon() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const revision = `v${BUILD_INFO.version} · ${BUILD_INFO.shortSha}`;

  const handleCopy = async () => {
    const payload = [
      `Version: v${BUILD_INFO.version}`,
      `Commit: ${BUILD_INFO.shortSha}`,
      `Branch: ${BUILD_INFO.branch}`,
      `Built: ${formatBuildTime(BUILD_INFO.builtAt)}`,
      `Runtime: ${BUILD_INFO.runtime}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: "calc(16px + env(safe-area-inset-bottom))",
        zIndex: 250,
      }}
    >
      {open && (
        <div
          style={{
            width: 240,
            marginBottom: 12,
            background: "rgba(20,19,26,0.94)",
            border: "1px solid " + C.b1,
            borderRadius: 16,
            padding: 14,
            boxShadow: "0 18px 48px rgba(0,0,0,.35)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: C.accentL,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                Live Release
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>
                {revision}
              </div>
            </div>
            <button
              onClick={handleCopy}
              style={{
                background: C.s3,
                color: copied ? C.green : C.t3,
                border: "1px solid " + C.b1,
                borderRadius: 999,
                padding: "6px 10px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <InfoRow label="Version" value={`v${BUILD_INFO.version}`} mono />
            <InfoRow label="Commit" value={BUILD_INFO.shortSha} mono />
            <InfoRow label="Branch" value={BUILD_INFO.branch} mono />
            <InfoRow label="Built" value={formatBuildTime(BUILD_INFO.builtAt)} />
            <InfoRow label="Source" value={BUILD_INFO.runtime} />
            {BUILD_INFO.deploymentId && (
              <InfoRow label="Deploy" value={BUILD_INFO.deploymentId} mono />
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        title={`Live build ${revision}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(20,19,26,0.92)",
          color: C.t1,
          border: "1px solid " + C.b1,
          borderRadius: 999,
          padding: "10px 14px 10px 10px",
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 14px 42px rgba(0,0,0,.28)",
          backdropFilter: "blur(16px)",
        }}
      >
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at 30% 30%, " + C.accentL + ", " + C.accentD + ")",
            color: C.bg,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0.3,
            boxShadow: "0 0 0 3px " + C.accentGlow,
          }}
        >
          V
        </span>
        <span style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
          <span
            style={{
              fontSize: 10,
              color: C.t4,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              fontWeight: 700,
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            Release
          </span>
          <span
            style={{
              fontSize: 12,
              color: C.t2,
              fontWeight: 700,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {revision}
          </span>
        </span>
      </button>
    </div>
  );
}
