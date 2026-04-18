import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { C } from "../lib/theme";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { Section, SectionLabel, SectionTitle } from "../components/ui/Section";
import { Loading, Empty, ErrorState } from "../components/StateView";

const DAYS = [
  ["availability_mon", "Mon"],
  ["availability_tue", "Tue"],
  ["availability_wed", "Wed"],
  ["availability_thu", "Thu"],
  ["availability_fri", "Fri"],
  ["availability_sat", "Sat"],
  ["availability_sun", "Sun"],
];

function Badge({ children, tone = "accent" }) {
  const colour =
    tone === "green" ? C.green : tone === "red" ? C.red : C.accent;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: 8,
        background: colour + "18",
        color: colour,
        letterSpacing: 0.3,
      }}
    >
      {children}
    </span>
  );
}

function Stat({ label, value, colour }) {
  return (
    <div
      style={{
        background: C.s2,
        borderRadius: 14,
        padding: "18px 20px",
        border: "1px solid " + C.b1,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: C.t4,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: colour || C.t1 }}>
        {value}
      </div>
    </div>
  );
}

export default function MarshalPublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    const { data: p, error: pErr } = await supabase
      .from("profiles")
      .select(
        "id, role, full_name, location, bio, avg_rating, total_jobs, reliability_pct, " +
          "has_sia, has_cscs, has_first_aid, has_own_transport, " +
          DAYS.map((d) => d[0]).join(", ")
      )
      .eq("id", id)
      .single();

    if (pErr || !p) {
      setError(pErr?.message || "Profile not found");
      setLoading(false);
      return;
    }
    setProfile(p);

    const { data: rData } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, reviewer:reviewer_id(full_name, role)")
      .eq("reviewed_user_id", id)
      .order("created_at", { ascending: false })
      .limit(10);
    setReviews(rData || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const certs = profile
    ? [
        ["has_sia", "SIA"],
        ["has_cscs", "CSCS"],
        ["has_first_aid", "First Aid"],
        ["has_own_transport", "Own Transport"],
      ].filter(([k]) => profile[k])
    : [];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
      <Navbar />
      <Section style={{ paddingTop: 100, maxWidth: 800 }}>
        <Link
          to={-1}
          onClick={(e) => {
            e.preventDefault();
            window.history.back();
          }}
          style={{
            fontSize: 13,
            color: C.t4,
            textDecoration: "none",
            marginBottom: 16,
            display: "inline-block",
          }}
        >
          &larr; Back
        </Link>

        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : !profile ? (
          <Empty title="Profile not found" />
        ) : (
          <>
            <SectionLabel>
              {profile.role === "manager" ? "Manager" : "Marshal"} Profile
            </SectionLabel>
            <SectionTitle>{profile.full_name || "Unnamed"}</SectionTitle>
            {profile.location && (
              <div style={{ fontSize: 14, color: C.t3, marginBottom: 8 }}>
                {"\ud83d\udccd"} {profile.location}
              </div>
            )}
            {profile.bio && (
              <p
                style={{
                  fontSize: 14,
                  color: C.t2,
                  lineHeight: 1.7,
                  marginBottom: 24,
                  maxWidth: 640,
                }}
              >
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12,
                marginBottom: 28,
              }}
            >
              <Stat
                label="Avg Rating"
                value={
                  profile.avg_rating > 0
                    ? `${Number(profile.avg_rating).toFixed(2)} \u2605`
                    : "No ratings"
                }
                colour={C.accent}
              />
              <Stat
                label="Jobs Done"
                value={profile.total_jobs || 0}
                colour={C.green}
              />
              <Stat
                label="Reliability"
                value={`${profile.reliability_pct ?? 100}%`}
                colour={
                  (profile.reliability_pct ?? 100) >= 90 ? C.green : C.orange
                }
              />
            </div>

            {/* Certs + Availability (marshal only) */}
            {profile.role === "marshal" && (
              <div style={{ marginBottom: 28 }}>
                {certs.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.t3,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginBottom: 10,
                      }}
                    >
                      Certifications
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {certs.map(([k, label]) => (
                        <Badge key={k} tone="green">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.t3,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      marginBottom: 10,
                    }}
                  >
                    Availability
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {DAYS.map(([k, label]) => {
                      const on = profile[k];
                      return (
                        <span
                          key={k}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "6px 12px",
                            borderRadius: 8,
                            background: on ? C.green + "18" : C.s3,
                            color: on ? C.green : C.t4,
                            border: "1px solid " + (on ? C.green + "33" : C.b1),
                          }}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.t3,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 12,
                }}
              >
                Recent Reviews ({reviews.length})
              </div>
              {reviews.length === 0 ? (
                <Empty
                  title="No reviews yet"
                  hint={
                    profile.role === "marshal"
                      ? "Reviews will appear after completed jobs."
                      : "Managers get reviews from marshals they've booked."
                  }
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        background: C.s2,
                        border: "1px solid " + C.b1,
                        borderRadius: 14,
                        padding: 18,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: 10,
                          marginBottom: 6,
                        }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>
                          {r.reviewer?.full_name || "Anonymous"}
                          <span
                            style={{
                              fontSize: 11,
                              color: C.t4,
                              fontWeight: 500,
                              marginLeft: 8,
                            }}
                          >
                            {r.reviewer?.role === "manager" ? "Manager" : "Marshal"}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: C.accent, fontWeight: 700 }}>
                          {"\u2605".repeat(r.rating)}
                          <span style={{ color: C.b2 }}>
                            {"\u2606".repeat(5 - r.rating)}
                          </span>
                        </div>
                      </div>
                      {r.comment && (
                        <p
                          style={{
                            fontSize: 13,
                            color: C.t2,
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {r.comment}
                        </p>
                      )}
                      <div
                        style={{
                          fontSize: 11,
                          color: C.t4,
                          marginTop: 8,
                        }}
                      >
                        {new Date(r.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </Section>
    </div>
  );
}
