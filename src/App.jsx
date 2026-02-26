import { useState, useEffect, useRef } from "react";

const C = {
  bg: "#050508", s1: "#0a0a10", s2: "#111118", s3: "#18181f",
  b1: "#222230", accent: "#6366f1", accentL: "#818cf8", accentD: "#4f46e5",
  green: "#10b981", orange: "#f59e0b", red: "#ef4444",
  t1: "#f1f5f9", t2: "#cbd5e1", t3: "#94a3b8", t4: "#64748b",
};

const Counter = ({ end, suffix = "", prefix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end, duration]);
  return <span ref={ref}>{prefix}{typeof end === "number" && end % 1 !== 0 ? count.toFixed(1) : count}{suffix}</span>;
};

const FadeIn = ({ children, delay = 0, style = {} }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(30px)", transition: `all 0.6s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
};

export default function LandingPage() {
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSubmit = () => {
    if (!email || !role) return;
    setSubmitted(true);
  };

  const Section = ({ children, style = {}, id }) => (
    <div id={id} style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px", ...style }}>{children}</div>
  );

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>{children}</div>
  );

  const SectionTitle = ({ children }) => (
    <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, color: C.t1, lineHeight: 1.15, letterSpacing: -1, margin: "0 0 16px" }}>{children}</h2>
  );

  return (
    <div style={{ background: C.bg, color: C.t1, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflowX: "hidden" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::selection{background:${C.accent};color:#fff}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .cta-btn{transition:all .2s !important}
        .cta-btn:hover{transform:translateY(-2px) !important;box-shadow:0 8px 30px rgba(99,102,241,.35) !important}
        .card-hover{transition:all .25s !important}
        .card-hover:hover{border-color:${C.accent}44 !important;transform:translateY(-4px) !important}
        input:focus{border-color:${C.accent} !important;outline:none}
      `}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: `${C.bg}dd`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.b1}44` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1, background: `linear-gradient(135deg,${C.accent},${C.accentL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MarshalHQ</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <a href="#how" style={{ color: C.t3, textDecoration: "none", fontSize: 13, fontWeight: 500, padding: "6px 12px" }}>How It Works</a>
            <a href="#why" style={{ color: C.t3, textDecoration: "none", fontSize: 13, fontWeight: 500, padding: "6px 12px" }}>Why MarshalHQ</a>
            <button className="cta-btn" onClick={scrollToForm} style={{ background: C.accent, color: "#fff", border: "none", padding: "9px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Join the Waitlist</button>
          </div>
        </div>
      </nav>

      <div style={{ position: "relative", overflow: "hidden", paddingTop: 80 }}>
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}12 0%, transparent 70%)`, pointerEvents: "none" }} />
        <Section style={{ textAlign: "center", paddingTop: 100, paddingBottom: 60, position: "relative" }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.accent}15`, border: `1px solid ${C.accent}33`, borderRadius: 50, padding: "6px 18px", marginBottom: 28, fontSize: 13, color: C.accentL, fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite" }} />
              Now accepting early access signups
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, maxWidth: 800, margin: "0 auto 20px" }}>
              Stop scrolling WhatsApp.<br/>
              <span style={{ background: `linear-gradient(135deg,${C.accent},${C.accentL},#c084fc)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Start getting booked.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: C.t3, maxWidth: 600, margin: "0 auto 36px", lineHeight: 1.6, fontWeight: 400 }}>
              The UK's first marketplace connecting location marshals with film and TV productions. Get matched to jobs instantly. Build your reputation. Get paid reliably.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="cta-btn" onClick={scrollToForm} style={{ background: `linear-gradient(135deg,${C.accent},${C.accentD})`, color: "#fff", border: "none", padding: "16px 36px", borderRadius: 14, fontSize: 17, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 20px ${C.accent}44` }}>
                Join the Waitlist
              </button>
              <a href="#how" style={{ display: "flex", alignItems: "center", gap: 8, color: C.t2, textDecoration: "none", padding: "16px 24px", fontSize: 16, fontWeight: 600 }}>
                See how it works
              </a>
            </div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 50, flexWrap: "wrap" }}>
              {[
                { v: 6.8, s: "bn", p: "\u00a3", l: "UK production spend in 2025" },
                { v: 361, s: "+", p: "", l: "Productions shot in the UK" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: C.t1 }}><Counter end={s.v} suffix={s.s} prefix={s.p} /></div>
                  <div style={{ fontSize: 12, color: C.t4, marginTop: 4, maxWidth: 160 }}>{s.l}</div>
                </div>
              ))}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: C.orange }}>0</div>
                <div style={{ fontSize: 12, color: C.t4, marginTop: 4, maxWidth: 160 }}>Platforms built for marshals</div>
              </div>
            </div>
          </FadeIn>
        </Section>
      </div>

      <div style={{ background: C.s1 }}>
        <Section>
          <FadeIn>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
              <SectionLabel>The Problem</SectionLabel>
              <SectionTitle>The WhatsApp group model is broken</SectionTitle>
              <p style={{ fontSize: 16, color: C.t3, lineHeight: 1.7 }}>
                Right now, hiring location marshals means posting in WhatsApp groups with hundreds of people, hoping the right ones see it in time, and manually tracking who confirmed. No ratings. No profiles. No accountability.
              </p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 48 }}>
            {[
              { icon: "\ud83d\ude24", title: "For Location Managers", points: ["Scrolling through hundreds of messages to find 4 marshals", "No way to check ratings or reliability", "No audit trail for production accounting", "If someone no-shows, zero accountability"] },
              { icon: "\ud83d\ude29", title: "For Marshals", points: ["Constantly monitoring multiple WhatsApp groups", "Miss a message by 10 minutes and the job is gone", "No way to build a portable reputation", "Good work goes unrecognised"] },
            ].map((c, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="card-hover" style={{ background: C.s2, borderRadius: 20, padding: 28, border: `1px solid ${C.b1}`, height: "100%" }}>
                  <div style={{ fontSize: 36, marginBottom: 14 }}>{c.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: C.t1, marginBottom: 14 }}>{c.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {c.points.map((p, j) => (
                      <div key={j} style={{ display: "flex", gap: 10, alignItems: "start" }}>
                        <span style={{ color: C.red, fontSize: 14, marginTop: 2, flexShrink: 0 }}>&#x2717;</span>
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

      <Section id="how">
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>How It Works</SectionLabel>
            <SectionTitle>From posting to fully crewed in minutes</SectionTitle>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[
            { step: "01", icon: "\ud83d\udcdd", title: "Post a Job", desc: "Location manager posts the job in under 60 seconds with date, location, rate and slots needed.", color: C.accent },
            { step: "02", icon: "\ud83d\udce1", title: "Instant Match", desc: "Verified marshals within range get an instant push notification. No WhatsApp scrolling required.", color: C.accentL },
            { step: "03", icon: "\u26a1", title: "Apply and Book", desc: "Marshals apply with one tap. Managers review ratings, reliability and certs then book instantly.", color: C.green },
            { step: "04", icon: "\u2b50", title: "Rate and Repeat", desc: "Both sides rate each other after the job. Build reputation. Find your go-to crew. Get rebooked.", color: C.orange },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div className="card-hover" style={{ background: C.s2, borderRadius: 20, padding: 28, border: `1px solid ${C.b1}`, textAlign: "center", height: "100%", position: "relative" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: s.color, letterSpacing: 1, marginBottom: 12 }}>STEP {s.step}</div>
                <div style={{ fontSize: 40, marginBottom: 14 }}>{s.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: C.t1, marginBottom: 8 }}>{s.title}</div>
                <p style={{ fontSize: 13, color: C.t3, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <div style={{ background: C.s1 }} id="why">
        <Section>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <SectionLabel>Built for Both Sides</SectionLabel>
              <SectionTitle>Whether you hire or get hired</SectionTitle>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            <FadeIn>
              <div style={{ background: `linear-gradient(135deg, ${C.accent}08, ${C.accent}03)`, borderRadius: 20, padding: 32, border: `1px solid ${C.accent}22` }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{"\ud83c\udfac"}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.t1, marginBottom: 16 }}>For Location Managers</div>
                {["Post a job and reach verified marshals in seconds", "Filter by rating, reliability, distance and certifications", "One-tap booking with instant confirmation", "Build a Favourites list for repeat hires", "Automated invoicing and payment processing", "Production-level dashboard for multi-day shoots"].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "start", marginBottom: 10 }}>
                    <span style={{ color: C.green, fontSize: 14, marginTop: 1, flexShrink: 0 }}>&#x2713;</span>
                    <span style={{ fontSize: 14, color: C.t2, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div style={{ background: `linear-gradient(135deg, ${C.green}08, ${C.green}03)`, borderRadius: 20, padding: 32, border: `1px solid ${C.green}22` }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{"\ud83e\uddba"}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.t1, marginBottom: 16 }}>For Location Marshals</div>
                {["Get push notifications for jobs matching your location", "Apply with one tap instead of racing to reply in WhatsApp", "Build a verified profile with ratings and reviews", "Track your earnings and download tax summaries", "Certifications displayed prominently (SIA, CSCS, First Aid)", "Get paid reliably through the platform every week"].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "start", marginBottom: 10 }}>
                    <span style={{ color: C.green, fontSize: 14, marginTop: 1, flexShrink: 0 }}>&#x2713;</span>
                    <span style={{ fontSize: 14, color: C.t2, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </Section>
      </div>

      <Section>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>The Opportunity</SectionLabel>
            <SectionTitle>The UK film industry has never been busier</SectionTitle>
            <p style={{ fontSize: 16, color: C.t3, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
              361 productions shot in the UK in 2025. Every single one needed marshals. We are building the infrastructure to connect them.
            </p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { n: "\u00a36.8bn", l: "UK production spend in 2025", sub: "22% increase on 2024" },
            { n: "361", l: "Films and HETV shows produced", sub: "Including Harry Potter, Avengers, The Beatles" },
            { n: "54%", l: "Of the film workforce is freelance", sub: "Already used to digital platforms" },
            { n: "< 5 min", l: "Our target fill time", sub: "vs hours on WhatsApp groups" },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="card-hover" style={{ background: C.s2, borderRadius: 16, padding: 24, border: `1px solid ${C.b1}`, textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: C.accent }}>{s.n}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.t1, marginTop: 6 }}>{s.l}</div>
                <div style={{ fontSize: 11, color: C.t4, marginTop: 4 }}>{s.sub}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

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
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 13, color: C.t4, fontWeight: 600, borderBottom: `1px solid ${C.b1}` }}></th>
                    <th style={{ padding: "14px 16px", textAlign: "center", fontSize: 13, color: C.t4, fontWeight: 600, borderBottom: `1px solid ${C.b1}` }}>WhatsApp Groups</th>
                    <th style={{ padding: "14px 16px", textAlign: "center", fontSize: 13, color: C.accent, fontWeight: 700, borderBottom: `1px solid ${C.accent}33`, background: `${C.accent}08` }}>MarshalHQ</th>
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
                  ].map(([feature, old, neu], i) => (
                    <tr key={i}>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: C.t2, borderBottom: `1px solid ${C.b1}22` }}>{feature}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, color: C.red, borderBottom: `1px solid ${C.b1}22` }}>{old}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, color: C.green, fontWeight: 600, borderBottom: `1px solid ${C.b1}22`, background: `${C.accent}05` }}>{neu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </Section>
      </div>

      <div ref={formRef}>
        <Section style={{ paddingTop: 80, paddingBottom: 100 }}>
          <FadeIn>
            <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
              <SectionLabel>Early Access</SectionLabel>
              <SectionTitle>Be first in line</SectionTitle>
              <p style={{ fontSize: 15, color: C.t3, lineHeight: 1.6, marginBottom: 32 }}>
                We are launching soon. Join the waitlist to get early access, zero platform fees for 3 months, and Founding Member status.
              </p>

              {submitted ? (
                <div style={{ padding: 40, background: `${C.green}10`, border: `1px solid ${C.green}33`, borderRadius: 20 }}>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>{"\ud83c\udfac"}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.green }}>You are on the list!</div>
                  <div style={{ fontSize: 14, color: C.t3, marginTop: 10, lineHeight: 1.6 }}>
                    We will be in touch soon with early access details.
                  </div>
                  <div style={{ marginTop: 20, padding: "14px 20px", background: C.s2, borderRadius: 12, border: `1px solid ${C.b1}` }}>
                    <div style={{ fontSize: 12, color: C.t4, marginBottom: 4 }}>Share with your crew:</div>
                    <div style={{ fontSize: 14, color: C.accent, fontWeight: 700 }}>marshalhq.com</div>
                  </div>
                </div>
              ) : (
                <div style={{ background: C.s2, borderRadius: 24, padding: 32, border: `1px solid ${C.b1}`, textAlign: "left" }}>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: .5, marginBottom: 10, display: "block" }}>I am a...</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {[
                        { id: "marshal", icon: "\ud83e\uddba", label: "Location Marshal" },
                        { id: "manager", icon: "\ud83c\udfac", label: "Location Manager" },
                      ].map((r) => (
                        <button key={r.id} onClick={() => setRole(r.id)} style={{ flex: 1, padding: "16px 12px", background: role === r.id ? `${C.accent}15` : C.s3, border: `2px solid ${role === r.id ? C.accent : C.b1}`, borderRadius: 14, cursor: "pointer", textAlign: "center", transition: "all .2s" }}>
                          <div style={{ fontSize: 24, marginBottom: 4 }}>{r.icon}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: role === r.id ? C.accent : C.t2 }}>{r.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6, display: "block" }}>Full Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ width: "100%", padding: "13px 16px", background: C.s3, border: `1px solid ${C.b1}`, borderRadius: 12, color: C.t1, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6, display: "block" }}>Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" style={{ width: "100%", padding: "13px 16px", background: C.s3, border: `1px solid ${C.b1}`, borderRadius: 12, color: C.t1, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6, display: "block" }}>Where are you based?</label>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. London, Manchester, Bristol" style={{ width: "100%", padding: "13px 16px", background: C.s3, border: `1px solid ${C.b1}`, borderRadius: 12, color: C.t1, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }} />
                  </div>

                  <button className="cta-btn" onClick={handleSubmit} disabled={!email || !role} style={{ width: "100%", padding: "16px", background: !email || !role ? C.b1 : `linear-gradient(135deg,${C.accent},${C.accentD})`, color: "#fff", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 800, cursor: !email || !role ? "not-allowed" : "pointer", boxShadow: email && role ? `0 4px 20px ${C.accent}44` : "none" }}>
                    Join the Waitlist
                  </button>

                  <div style={{ textAlign: "center", marginTop: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: C.t4 }}>
                      {"\ud83d\udd12"} No spam. Unsubscribe anytime.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        </Section>
      </div>

      {!submitted && (
        <div style={{ background: C.s1 }}>
          <Section style={{ paddingTop: 50, paddingBottom: 50 }}>
            <FadeIn>
              <div style={{ background: `linear-gradient(135deg, ${C.accent}10, ${C.accentL}08)`, borderRadius: 24, padding: "40px 32px", border: `1px solid ${C.accent}22`, textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>{"\u2b50"} Founding Member Perks</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: C.t1, marginBottom: 16 }}>Join now. Pay nothing for 3 months.</div>
                <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
                  {[
                    { icon: "\ud83c\udff7\ufe0f", text: "Zero fees for 3 months" },
                    { icon: "\u2b50", text: "Permanent Founding Member badge" },
                    { icon: "\ud83d\udd14", text: "Priority access to jobs" },
                    { icon: "\ud83d\udcac", text: "Direct input on features" },
                  ].map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{p.icon}</span>
                      <span style={{ fontSize: 14, color: C.t2, fontWeight: 600 }}>{p.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </Section>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${C.b1}22` }}>
        <Section style={{ paddingTop: 32, paddingBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, background: `linear-gradient(135deg,${C.accent},${C.accentL})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MarshalHQ</div>
              <div style={{ fontSize: 12, color: C.t4, marginTop: 4 }}>The UK marketplace for film location marshals</div>
            </div>
            <div style={{ fontSize: 12, color: C.t4 }}>
              2026 MarshalHQ | marshalhq.com
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
