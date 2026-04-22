import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { C, FONT, FONT_DISPLAY } from "../lib/theme";
import { useAuth } from "../lib/AuthContext";

function RolePicker({ role, onChange }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button
        type="button"
        onClick={() => onChange("marshal")}
        style={{
          flex: 1,
          padding: "18px 12px",
          background: role === "marshal" ? C.accent + "12" : C.s3,
          border: "2px solid " + (role === "marshal" ? C.accent : C.b1),
          borderRadius: 12,
          cursor: "pointer",
          textAlign: "center",
          fontFamily: "inherit",
        }}
      >
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
        onClick={() => onChange("manager")}
        style={{
          flex: 1,
          padding: "18px 12px",
          background: role === "manager" ? C.accent + "12" : C.s3,
          border: "2px solid " + (role === "manager" ? C.accent : C.b1),
          borderRadius: 12,
          cursor: "pointer",
          textAlign: "center",
          fontFamily: "inherit",
        }}
      >
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
  );
}

function PageShell({ children }) {
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
      <div style={{ maxWidth: 440, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
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
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const oauthSource = searchParams.get("oauth");

  const [mode, setMode] = useState(urlMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const [handledMissingGoogleSignup, setHandledMissingGoogleSignup] = useState(false);

  const { user, profile, signUp, signIn, signInWithGoogle, signOut, completeProfile } = useAuth();

  useEffect(() => {
    setMode(urlMode);
  }, [urlMode]);

  useEffect(() => {
    if (user && !profile && mode === "signup") {
      setFullName((current) => {
        if (current) return current;
        return user.user_metadata?.full_name || user.user_metadata?.name || user.email || "";
      });
    }
  }, [user, profile, mode]);

  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === "manager" ? "/manager/dashboard" : "/marshal/dashboard", {
        replace: true,
      });
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    if (!user || profile || mode !== "login" || oauthSource !== "google" || handledMissingGoogleSignup) {
      return;
    }

    let ignore = false;
    setHandledMissingGoogleSignup(true);

    (async () => {
      await signOut();
      if (ignore) return;

      setLoading(false);
      setGoogleLoading(false);
      setError("This Google account has not finished signup yet. Use Sign Up with Google first.");
      navigate("/login?mode=signup", { replace: true });
    })();

    return () => {
      ignore = true;
    };
  }, [user, profile, mode, oauthSource, handledMissingGoogleSignup, signOut, navigate]);

  useEffect(() => {
    if (!user) {
      setHandledMissingGoogleSignup(false);
    }
  }, [user]);

  const updateMode = (nextMode) => {
    setMode(nextMode);
    setError(null);
    setConfirmSent(false);
    navigate(nextMode === "signup" ? "/login?mode=signup" : "/login", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

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

        const { error: signUpError } = await signUp(email, password, role, fullName.trim());

        if (signUpError) {
          setError(signUpError.message);
        } else {
          setConfirmSent(true);
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error.message);
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const { error: authError } = await signInWithGoogle({ mode });

      if (authError) {
        setError(authError.message);
        setGoogleLoading(false);
      }
    } catch (err) {
      setError(err.message || "Unable to continue with Google right now.");
      setGoogleLoading(false);
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: profileError } = await completeProfile({
        role,
        fullName: fullName.trim(),
      });

      if (profileError) {
        setError(profileError.message);
      }
    } catch (err) {
      setError(err.message || "Unable to finish signup right now.");
    }

    setLoading(false);
  };

  const showOnboarding = Boolean(user && !profile && mode === "signup");
  const isBusy = loading || googleLoading;

  if (showOnboarding) {
    return (
      <PageShell>
        <div style={{ textAlign: "center", fontSize: 14, color: C.t3, marginBottom: 32 }}>
          Complete your account
        </div>

        <form onSubmit={handleCompleteProfile}>
          <div
            style={{
              background: C.s2,
              borderRadius: 20,
              padding: 32,
              border: "1px solid " + C.b1,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: C.t1, marginBottom: 10 }}>
              Finish sign up
            </div>
            <p style={{ fontSize: 14, color: C.t3, lineHeight: 1.6, marginBottom: 20 }}>
              Your Google account is connected as <strong style={{ color: C.t1 }}>{user?.email}</strong>.
              Tell us your full name and whether you are signing up as a marshal or manager.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.t3,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 10,
                  display: "block",
                }}
              >
                I am a...
              </label>
              <RolePicker role={role} onChange={setRole} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.t3,
                  textTransform: "uppercase",
                  letterSpacing: 1,
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
                  borderRadius: 10,
                  color: C.t1,
                  fontSize: 14,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#ef444415",
                  border: "1px solid #ef444433",
                  borderRadius: 8,
                  marginBottom: 14,
                  fontSize: 13,
                  color: C.red,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cta-btn"
              style={{
                width: "100%",
                padding: "16px",
                background: C.accent,
                color: C.bg,
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                fontFamily: "inherit",
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              {loading ? "Saving..." : "Finish Sign Up"}
            </button>

            <button
              type="button"
              onClick={async () => {
                setError(null);
                await signOut();
                navigate("/login?mode=signup", { replace: true });
              }}
              style={{
                width: "100%",
                padding: "14px",
                background: C.s3,
                color: C.t2,
                border: "1px solid " + C.b1,
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Use a different Google account
            </button>
          </div>
        </form>
      </PageShell>
    );
  }

  if (confirmSent) {
    return (
      <PageShell>
        <div style={{ textAlign: "center", maxWidth: 440, width: "100%" }}>
          <div
            style={{
              background: C.s2,
              borderRadius: 20,
              padding: 40,
              border: "1px solid " + C.b1,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: C.accent,
                textTransform: "uppercase",
                letterSpacing: 2,
                marginBottom: 16,
              }}
            >
              Check your email
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: C.t1,
                marginBottom: 12,
              }}
            >
              Confirmation sent
            </div>
            <p style={{ fontSize: 14, color: C.t3, lineHeight: 1.6, marginBottom: 24 }}>
              We've sent a confirmation link to <strong style={{ color: C.t1 }}>{email}</strong>.
              Click the link to activate your account.
            </p>
            <button
              onClick={() => updateMode("login")}
              style={{
                background: C.s3,
                color: C.t2,
                border: "1px solid " + C.b1,
                padding: "12px 24px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Back to Log In
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div style={{ textAlign: "center", marginBottom: 32, fontSize: 14, color: C.t3 }}>
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </div>

      <div
        style={{
          display: "flex",
          background: C.s2,
          borderRadius: 10,
          padding: 4,
          marginBottom: 24,
          border: "1px solid " + C.b1,
        }}
      >
        {["login", "signup"].map((tab) => (
          <button
            key={tab}
            onClick={() => updateMode(tab)}
            style={{
              flex: 1,
              padding: "12px",
              background: mode === tab ? C.s3 : "transparent",
              color: mode === tab ? C.t1 : C.t4,
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {tab === "login" ? "Log In" : "Sign Up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: C.s2,
            borderRadius: 20,
            padding: 32,
            border: "1px solid " + C.b1,
          }}
        >
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isBusy}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: C.s3,
              color: C.t1,
              border: "1px solid " + C.b1,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.7 : 1,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: mode === "signup" ? 10 : 18,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background:
                  "conic-gradient(from 45deg, #4285F4 0 25%, #34A853 25% 50%, #FBBC05 50% 75%, #EA4335 75% 100%)",
                display: "inline-block",
              }}
            />
            {googleLoading
              ? "Redirecting to Google..."
              : mode === "signup"
                ? "Sign Up with Google"
                : "Continue with Google"}
          </button>

          {mode === "signup" && (
            <div style={{ fontSize: 12, color: C.t4, textAlign: "center", marginBottom: 18 }}>
              After Google verifies your email, we&apos;ll ask for your full name and whether you are
              signing up as a marshal or manager.
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div style={{ flex: 1, height: 1, background: C.b1 }} />
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.t4,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Or use email
            </div>
            <div style={{ flex: 1, height: 1, background: C.b1 }} />
          </div>

          {mode === "signup" && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.t3,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 10,
                    display: "block",
                  }}
                >
                  I am a...
                </label>
                <RolePicker role={role} onChange={setRole} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.t3,
                    textTransform: "uppercase",
                    letterSpacing: 1,
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
                    borderRadius: 10,
                    color: C.t1,
                    fontSize: 14,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.t3,
                textTransform: "uppercase",
                letterSpacing: 1,
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
                borderRadius: 10,
                color: C.t1,
                fontSize: 14,
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.t3,
                textTransform: "uppercase",
                letterSpacing: 1,
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
                borderRadius: 10,
                color: C.t1,
                fontSize: 14,
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "#ef444415",
                border: "1px solid #ef444433",
                borderRadius: 8,
                marginBottom: 14,
                fontSize: 13,
                color: C.red,
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="cta-btn"
            style={{
              width: "100%",
              padding: "16px",
              background: C.accent,
              color: C.bg,
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.7 : 1,
              fontFamily: "inherit",
              letterSpacing: 0.5,
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
                ? "Create Account with Email"
                : "Log In"}
          </button>
        </div>
      </form>

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
    </PageShell>
  );
}
