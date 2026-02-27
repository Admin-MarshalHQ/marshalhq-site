import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { C, FONT } from "../lib/theme";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const { user, profile, signUp, signIn } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === "manager" ? "/manager/dashboard" : "/marshal/dashboard", {
        replace: true,
      });
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!role) {
          setError("Please select your role.");
          setLoading(false);
          return;
        }
        if (!fullName.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        const { error: err } = await signUp(email, password, role, fullName.trim());
        if (err) {
          setError(err.message);
        } else {
          setConfirmSent(true);
        }
      } else {
        const { error: err } = await signIn(email, password);
        if (err) {
          setError(err.message);
        }
        // signIn succeeded — onAuthStateChange will set user/profile
        // and the useEffect redirect will fire
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  if (confirmSent) {
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
          <div
            style={{
              background: C.s2,
              borderRadius: 24,
              padding: 40,
              border: "1px solid " + C.b1,
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 16 }}>{"\u2709\ufe0f"}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.t1, marginBottom: 8 }}>
              Check your email
            </div>
            <p style={{ fontSize: 14, color: C.t3, lineHeight: 1.6, marginBottom: 24 }}>
              We've sent a confirmation link to <strong style={{ color: C.t1 }}>{email}</strong>.
              Click the link to activate your account.
            </p>
            <button
              onClick={() => {
                setConfirmSent(false);
                setMode("login");
              }}
              style={{
                background: C.s3,
                color: C.t2,
                border: "1px solid " + C.b1,
                padding: "12px 24px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Back to Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      <div style={{ maxWidth: 440, width: "100%" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
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
          </Link>
          <div style={{ fontSize: 14, color: C.t3 }}>
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </div>
        </div>

        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            background: C.s2,
            borderRadius: 14,
            padding: 4,
            marginBottom: 24,
            border: "1px solid " + C.b1,
          }}
        >
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              style={{
                flex: 1,
                padding: "12px",
                background: mode === m ? C.s3 : "transparent",
                color: mode === m ? C.t1 : C.t4,
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: C.s2,
              borderRadius: 24,
              padding: 32,
              border: "1px solid " + C.b1,
            }}
          >
            {/* Role selection (signup only) */}
            {mode === "signup" && (
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.t3,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 10,
                    display: "block",
                  }}
                >
                  I am a...
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setRole("marshal")}
                    style={{
                      flex: 1,
                      padding: "18px 12px",
                      background: role === "marshal" ? "#6366f115" : C.s3,
                      border: "2px solid " + (role === "marshal" ? C.accent : C.b1),
                      borderRadius: 14,
                      cursor: "pointer",
                      textAlign: "center",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{"\ud83e\uddba"}</div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: role === "marshal" ? C.accent : C.t2,
                      }}
                    >
                      Location Marshal
                    </div>
                    <div style={{ fontSize: 11, color: C.t4, marginTop: 4 }}>I want to find work</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("manager")}
                    style={{
                      flex: 1,
                      padding: "18px 12px",
                      background: role === "manager" ? "#6366f115" : C.s3,
                      border: "2px solid " + (role === "manager" ? C.accent : C.b1),
                      borderRadius: 14,
                      cursor: "pointer",
                      textAlign: "center",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{"\ud83c\udfac"}</div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: role === "manager" ? C.accent : C.t2,
                      }}
                    >
                      Location Manager
                    </div>
                    <div style={{ fontSize: 11, color: C.t4, marginTop: 4 }}>I want to hire</div>
                  </button>
                </div>
              </div>
            )}

            {/* Full Name (signup only) */}
            {mode === "signup" && (
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.t3,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    background: C.s3,
                    border: "1px solid " + C.b1,
                    borderRadius: 12,
                    color: C.t1,
                    fontSize: 14,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.t3,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  background: C.s3,
                  border: "1px solid " + C.b1,
                  borderRadius: 12,
                  color: C.t1,
                  fontSize: 14,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.t3,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Your password"}
                required
                minLength={6}
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  background: C.s3,
                  border: "1px solid " + C.b1,
                  borderRadius: 12,
                  color: C.t1,
                  fontSize: 14,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#ef444415",
                  border: "1px solid #ef444433",
                  borderRadius: 10,
                  marginBottom: 14,
                  fontSize: 13,
                  color: C.red,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="cta-btn"
              style={{
                width: "100%",
                padding: "16px",
                background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                fontFamily: "inherit",
                boxShadow: "0 4px 20px #6366f144",
              }}
            >
              {loading
                ? "Please wait..."
                : mode === "signup"
                  ? "Create Account"
                  : "Log In"}
            </button>
          </div>
        </form>

        {/* Back to landing */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link
            to="/"
            style={{
              fontSize: 13,
              color: C.t4,
              textDecoration: "none",
            }}
          >
            Back to marshalhq.com
          </Link>
        </div>
      </div>
    </div>
  );
}
