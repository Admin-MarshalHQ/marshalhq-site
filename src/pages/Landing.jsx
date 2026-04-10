import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { C, FONT_DISPLAY } from "../lib/theme";
import FadeIn from "../components/ui/FadeIn";
import Counter from "../components/ui/Counter";
import { Section, SectionLabel, SectionTitle } from "../components/ui/Section";

export default function Landing() {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const formRef = useRef(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSubmit = async () => {
    if (!email || !role) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("https://formspree.io/f/xwvnydov", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, role, location }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", paddingTop: 80 }}>
        <div
          style={{
            position: "absolute",
            top: -200,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background: "radial-gradient(circle, " + C.accent + "0a 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <Section style={{ textAlign: "center", paddingTop: 100, paddingBottom: 60, position: "relative" }}>
          <FadeIn>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: C.accent + "12",
                border: "1px solid " + C.accent + "33",
                borderRadius: 50,
                padding: "6px 18px",
                marginBottom: 28,
                fontSize: 12,
                color: C.accentL,
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Early Access &mdash; Now Open
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1
              style={{
                fontSize: "clamp(36px, 6vw, 64px)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: -1.5,
                maxWidth: 800,
                margin: "0 auto 20px",
                color: C.t1,
              }}
            >
              The professional way to{" "}
              <span style={{ color: C.accent }}>
                hire location marshals.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p
              style={{
                fontSize: "clamp(16px, 2vw, 20px)",
                color: C.t3,
                maxWidth: 600,
                margin: "0 auto 36px",
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              The UK's first dedicated marketplace for film and television location marshals.
              Verified profiles. Instant matching. Reliable payments.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="cta-btn"
                onClick={scrollToForm}
                style={{
                  background: C.accent,
                  color: C.bg,
                  border: "none",
                  padding: "16px 36px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: 0.5,
                  fontFamily: "inherit",
                }}
              >
                Join the Waitlist
              </button>
              <a
                href="#how"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: C.t2,
                  textDecoration: "none",
                  padding: "16px 24px",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "color .2s",
                }}
              >
                See how it works
              </a>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div
              style={{
                display: "flex",
                gap: 32,
                justifyContent: "center",
                marginTop: 50,
                flexWrap: "wrap",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: C.t1 }}>
                  <Counter end={6.8} suffix="bn" prefix={"\u00a3"} />
                </div>
                <div style={{ fontSize: 12, color: C.t4, marginTop: 4, maxWidth: 160 }}>
                  UK production spend in 2025
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: C.t1 }}>
                  <Counter end={361} suffix="+" />
                </div>
                <div style={{ fontSize: 12, color: C.t4, marginTop: 4, maxWidth: 160 }}>
                  Productions shot in the UK
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: C.orange }}>0</div>
                <div style={{ fontSize: 12, color: C.t4, marginTop: 4, maxWidth: 160 }}>
                  Platforms built for marshals
                </div>
              </div>
            </div>
          </FadeIn>
        </Section>
      </div>

      {/* Problem */}
      <div style={{ background: C.s1 }}>
        <Section>
          <FadeIn>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
              <SectionLabel>The Problem</SectionLabel>
              <SectionTitle>An industry without infrastructure</SectionTitle>
              <p style={{ fontSize: 16, color: C.t3, lineHeight: 1.7 }}>
                Location marshals are currently sourced through informal WhatsApp groups — a method
                that offers no vetting, no profiles, no ratings, and no audit trail. MarshalHQ
                replaces this with purpose-built infrastructure.
              </p>
            </div>
          </FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
              marginTop: 48,
            }}
          >
            {[
              {
                title: "For Location Managers",
                points: [
                  "Searching through hundreds of messages to find available marshals",
                  "No way to verify ratings or reliability before hiring",
                  "No audit trail for production accounting",
                  "No accountability when crew fail to arrive",
                ],
              },
              {
                title: "For Marshals",
                points: [
                  "Monitoring multiple WhatsApp groups around the clock",
                  "A ten-minute delay can mean losing the booking",
                  "No way to build a portable, verifiable reputation",
                  "Consistent good work goes unrecognised",
                ],
              },
            ].map((c, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div
                  className="card-hover"
                  style={{
                    background: C.s2,
                    borderRadius: 14,
                    padding: 28,
                    border: "1px solid " + C.b1,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: C.t1,
                      marginBottom: 16,
                    }}
                  >
                    {c.title}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {c.points.map((p, j) => (
                      <div key={j} style={{ display: "flex", gap: 10, alignItems: "start" }}>
                        <span style={{ color: C.red, fontSize: 14, marginTop: 2, flexShrink: 0 }}>
                          &#x2717;
                        </span>
                        <span style={{ fontSize: 14, color: C.t3, lineHeight: 1.5 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Section>
      </div>

      {/* How It Works */}
      <Section id="how">
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>How It Works</SectionLabel>
            <SectionTitle>From job posting to confirmed crew in minutes</SectionTitle>
          </div>
        </FadeIn>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {[
            {
              step: "01",
              title: "Post a Job",
              desc: "Location manager posts the job in under 60 seconds with date, location, rate and slots needed.",
              color: C.accent,
            },
            {
              step: "02",
              title: "Instant Match",
              desc: "Verified marshals within range receive an instant notification. No manual outreach required.",
              color: C.accentL,
            },
            {
              step: "03",
              title: "Apply and Book",
              desc: "Marshals apply with one tap. Managers review ratings, reliability and certs then book instantly.",
              color: C.green,
            },
            {
              step: "04",
              title: "Rate and Repeat",
              desc: "Both parties rate each other after the job. Build a verified track record and establish repeat working relationships.",
              color: C.orange,
            },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div
                className="card-hover"
                style={{
                  background: C.s2,
                  borderRadius: 14,
                  padding: 28,
                  border: "1px solid " + C.b1,
                  textAlign: "center",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: s.color,
                    letterSpacing: 2,
                    marginBottom: 16,
                    textTransform: "uppercase",
                  }}
                >
                  Step {s.step}
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: C.t1,
                    marginBottom: 8,
                  }}
                >
                  {s.title}
                </div>
                <p style={{ fontSize: 13, color: C.t3, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Both Sides */}
      <div style={{ background: C.s1 }} id="why">
        <Section>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <SectionLabel>Built for Both Sides</SectionLabel>
              <SectionTitle>Purpose-built for both sides of the booking</SectionTitle>
            </div>
          </FadeIn>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            <FadeIn>
              <div
                style={{
                  background: C.accent + "06",
                  borderRadius: 14,
                  padding: 32,
                  border: "1px solid " + C.accent + "20",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.t1,
                    marginBottom: 16,
                  }}
                >
                  For Location Managers
                </div>
                {[
                  "Post a job and reach verified marshals in seconds",
                  "Filter by rating, reliability, distance and certifications",
                  "One-tap booking with instant confirmation",
                  "Build a Favourites list for repeat hires",
                  "Automated invoicing and payment processing",
                  "Production-level dashboard for multi-day shoots",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "start", marginBottom: 10 }}>
                    <span style={{ color: C.green, fontSize: 14, marginTop: 1, flexShrink: 0 }}>
                      &#x2713;
                    </span>
                    <span style={{ fontSize: 14, color: C.t2, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div
                style={{
                  background: C.green + "06",
                  borderRadius: 14,
                  padding: 32,
                  border: "1px solid " + C.green + "20",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: C.t1,
                    marginBottom: 16,
                  }}
                >
                  For Location Marshals
                </div>
                {[
                  "Get push notifications for jobs matching your location",
                  "Apply with one tap instead of competing for visibility in group chats",
                  "Build a verified profile with ratings and reviews",
                  "Track your earnings and download tax summaries",
                  "Certifications displayed prominently (SIA, CSCS, First Aid)",
                  "Get paid reliably through the platform every week",
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "start", marginBottom: 10 }}>
                    <span style={{ color: C.green, fontSize: 14, marginTop: 1, flexShrink: 0 }}>
                      &#x2713;
                    </span>
                    <span style={{ fontSize: 14, color: C.t2, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </Section>
      </div>

      {/* Stats */}
      <Section>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>The Opportunity</SectionLabel>
            <SectionTitle>A growing industry with no dedicated tooling</SectionTitle>
            <p style={{ fontSize: 16, color: C.t3, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
              361 productions were filmed in the UK in 2025, each requiring location marshals.
              MarshalHQ provides the infrastructure to connect them efficiently.
            </p>
          </div>
        </FadeIn>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {[
            { n: "\u00a36.8bn", l: "UK production spend in 2025", sub: "22% increase on 2024" },
            {
              n: "361",
              l: "Films and HETV shows produced",
              sub: "Including Harry Potter, Avengers, The Beatles",
            },
            { n: "54%", l: "Of the film workforce is freelance", sub: "Already used to digital platforms" },
            { n: "< 5 min", l: "Our target fill time", sub: "vs hours on WhatsApp groups" },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <div
                className="card-hover"
                style={{
                  background: C.s2,
                  borderRadius: 14,
                  padding: 24,
                  border: "1px solid " + C.b1,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 800, color: C.accent }}>{s.n}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.t1, marginTop: 6 }}>{s.l}</div>
                <div style={{ fontSize: 11, color: C.t4, marginTop: 4 }}>{s.sub}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* Comparison Table */}
      <div style={{ background: C.s1 }}>
        <Section>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <SectionLabel>Why Switch</SectionLabel>
              <SectionTitle>MarshalHQ vs WhatsApp Groups</SectionTitle>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: "14px 16px",
                        textAlign: "left",
                        fontSize: 12,
                        color: C.t4,
                        fontWeight: 600,
                        borderBottom: "1px solid " + C.b1,
                      }}
                    />
                    <th
                      style={{
                        padding: "14px 16px",
                        textAlign: "center",
                        fontSize: 12,
                        color: C.t4,
                        fontWeight: 600,
                        borderBottom: "1px solid " + C.b1,
                      }}
                    >
                      WhatsApp Groups
                    </th>
                    <th
                      style={{
                        padding: "14px 16px",
                        textAlign: "center",
                        fontSize: 12,
                        color: C.accent,
                        fontWeight: 700,
                        borderBottom: "1px solid " + C.accent + "33",
                        background: C.accent + "08",
                      }}
                    >
                      MarshalHQ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Time to fill", "Hours", "Minutes"],
                    ["Quality assurance", "None", "Ratings and reliability scores"],
                    ["Availability visibility", "None", "Real-time calendar"],
                    ["Accountability", "None", "Review system and no-show tracking"],
                    ["Payment", "Manual bank transfers", "Automated with invoicing"],
                    ["Compliance", "Manual cert checks", "Verified profiles"],
                    ["Search and filter", "Impossible", "By rating, distance and certs"],
                  ].map((row, i) => (
                    <tr key={i}>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.t2,
                          borderBottom: "1px solid " + C.b1 + "44",
                        }}
                      >
                        {row[0]}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "center",
                          fontSize: 13,
                          color: C.red,
                          borderBottom: "1px solid " + C.b1 + "44",
                        }}
                      >
                        {row[1]}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          textAlign: "center",
                          fontSize: 13,
                          color: C.green,
                          fontWeight: 600,
                          borderBottom: "1px solid " + C.b1 + "44",
                          background: C.accent + "05",
                        }}
                      >
                        {row[2]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </Section>
      </div>

      {/* Waitlist Form */}
      <div ref={formRef} id="waitlist">
        <Section style={{ paddingTop: 80, paddingBottom: 100 }}>
          <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
            <SectionLabel>Early Access</SectionLabel>
            <SectionTitle>Register your interest</SectionTitle>
            <p style={{ fontSize: 15, color: C.t3, lineHeight: 1.6, marginBottom: 32 }}>
              MarshalHQ is launching soon. Register for early access to receive zero platform fees
              for three months and Founding Member status.
            </p>

            {submitted ? (
              <div
                style={{
                  padding: 40,
                  background: C.green + "10",
                  border: "1px solid " + C.green + "33",
                  borderRadius: 14,
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 700, color: C.green }}>Registration confirmed</div>
                <div style={{ fontSize: 14, color: C.t3, marginTop: 10, lineHeight: 1.6 }}>
                  We will be in touch soon with early access details.
                </div>
                <div
                  style={{
                    marginTop: 20,
                    padding: "14px 20px",
                    background: C.s2,
                    borderRadius: 10,
                    border: "1px solid " + C.b1,
                  }}
                >
                  <div style={{ fontSize: 12, color: C.t4, marginBottom: 4 }}>Share with colleagues:</div>
                  <div style={{ fontSize: 14, color: C.accent, fontWeight: 700 }}>marshalhq.com</div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: C.s2,
                  borderRadius: 14,
                  padding: 32,
                  border: "1px solid " + C.b1,
                  textAlign: "left",
                }}
              >
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
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setRole("marshal")}
                      style={{
                        flex: 1,
                        padding: "18px 12px",
                        background: role === "marshal" ? C.accent + "12" : C.s3,
                        border: "2px solid " + (role === "marshal" ? C.accent : C.b1),
                        borderRadius: 10,
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
                    </button>
                    <button
                      onClick={() => setRole("manager")}
                      style={{
                        flex: 1,
                        padding: "18px 12px",
                        background: role === "manager" ? C.accent + "12" : C.s3,
                        border: "2px solid " + (role === "manager" ? C.accent : C.b1),
                        borderRadius: 10,
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
                    </button>
                  </div>
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    style={{
                      width: "100%",
                      padding: "13px 16px",
                      background: C.s3,
                      border: "1px solid " + C.b1,
                      borderRadius: 8,
                      color: C.t1,
                      fontSize: 14,
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
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
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="you@email.com"
                    style={{
                      width: "100%",
                      padding: "13px 16px",
                      background: C.s3,
                      border: "1px solid " + C.b1,
                      borderRadius: 8,
                      color: C.t1,
                      fontSize: 14,
                      fontFamily: "inherit",
                      boxSizing: "border-box",
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
                    Where are you based?
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. London, Manchester, Bristol"
                    style={{
                      width: "100%",
                      padding: "13px 16px",
                      background: C.s3,
                      border: "1px solid " + C.b1,
                      borderRadius: 8,
                      color: C.t1,
                      fontSize: 14,
                      fontFamily: "inherit",
                      boxSizing: "border-box",
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
                  className="cta-btn"
                  onClick={handleSubmit}
                  disabled={!email || !role || submitting}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: !email || !role ? C.b1 : C.accent,
                    color: !email || !role ? C.t4 : C.bg,
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: !email || !role || submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                    fontFamily: "inherit",
                    letterSpacing: 0.5,
                  }}
                >
                  {submitting ? "Submitting..." : "Join the Waitlist"}
                </button>

                <div style={{ textAlign: "center", marginTop: 14 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: 12,
                      color: C.t4,
                    }}
                  >
                    Your information is kept private. Unsubscribe anytime.
                  </div>
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* Founding Member Perks */}
      {!submitted && (
        <div style={{ background: C.s1 }}>
          <Section style={{ paddingTop: 50, paddingBottom: 50 }}>
            <FadeIn>
              <div
                style={{
                  background: C.accent + "08",
                  borderRadius: 14,
                  padding: "40px 32px",
                  border: "1px solid " + C.accent + "20",
                  textAlign: "center",
                  maxWidth: 700,
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.orange,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    marginBottom: 10,
                  }}
                >
                  Founding Member Benefits
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: C.t1,
                    marginBottom: 16,
                  }}
                >
                  Register now. Zero platform fees for three months.
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginTop: 20,
                  }}
                >
                  {[
                    "Zero platform fees for three months",
                    "Permanent Founding Member badge",
                    "Priority access to job listings",
                    "Direct input on product development",
                  ].map((text, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16, color: C.accent, fontWeight: 700 }}>&mdash;</span>
                      <span style={{ fontSize: 14, color: C.t2, fontWeight: 500 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </Section>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "1px solid " + C.b1 + "44" }}>
        <Section style={{ paddingTop: 32, paddingBottom: 32 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 20,
                  fontWeight: 400,
                  color: C.accent,
                }}
              >
                MarshalHQ
              </div>
              <div style={{ fontSize: 12, color: C.t4, marginTop: 4 }}>
                The UK marketplace for film location marshals
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.t4 }}>2026 MarshalHQ | marshalhq.com</div>
          </div>
        </Section>
      </div>
    </>
  );
}
