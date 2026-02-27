import { Link } from "react-router-dom";
import { C } from "../../lib/theme";
import { useAuth } from "../../lib/AuthContext";
import Navbar from "../../components/Navbar";
import { Section, SectionLabel, SectionTitle } from "../../components/ui/Section";

export default function MarshalDashboard() {
  const { profile } = useAuth();

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
      <Navbar />
      <Section style={{ paddingTop: 100 }}>
        <SectionLabel>Marshal Dashboard</SectionLabel>
        <SectionTitle>
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </SectionTitle>
        <p style={{ fontSize: 16, color: C.t3, marginBottom: 32 }}>
          Your job feed and applications will appear here.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {[
            {
              title: "Available Jobs",
              value: "0",
              desc: "Jobs matching your area",
              color: C.accent,
            },
            {
              title: "My Applications",
              value: "0",
              desc: "Pending and accepted",
              color: C.orange,
            },
            {
              title: "Jobs Completed",
              value: "0",
              desc: "Your track record",
              color: C.green,
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: C.s2,
                borderRadius: 16,
                padding: 24,
                border: "1px solid " + C.b1,
              }}
            >
              <div style={{ fontSize: 12, color: C.t4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 13, color: C.t4, marginTop: 4 }}>{card.desc}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 40,
            padding: 32,
            background: C.s2,
            borderRadius: 20,
            border: "1px solid " + C.b1,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>{"\ud83d\udee0\ufe0f"}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.t1, marginBottom: 8 }}>
            Coming Soon
          </div>
          <p style={{ fontSize: 14, color: C.t3, maxWidth: 400, margin: "0 auto" }}>
            Job listings, one-tap applications, and your marshal profile are being built. Check back
            soon.
          </p>
        </div>
      </Section>
    </div>
  );
}
