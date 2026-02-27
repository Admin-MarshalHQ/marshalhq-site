import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { C } from "../../lib/theme";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import JobCard from "../../components/JobCard";
import { Section, SectionLabel, SectionTitle } from "../../components/ui/Section";

export default function MarshalDashboard() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("jobs");

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch live jobs
    const { data: jobData } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "live")
      .order("is_urgent", { ascending: false })
      .order("created_at", { ascending: false });

    setJobs(jobData || []);

    // Fetch my applications with job data
    const { data: appData } = await supabase
      .from("applications")
      .select("*, jobs(*)")
      .eq("applicant_id", user.id)
      .order("applied_at", { ascending: false });

    setMyApps(appData || []);
    setLoading(false);
  };

  const pendingApps = myApps.filter((a) => a.status === "pending").length;
  const acceptedApps = myApps.filter((a) => a.status === "accepted").length;

  const statusColors = { pending: C.orange, accepted: C.green, declined: C.red };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
      <Navbar />
      <Section style={{ paddingTop: 100 }}>
        <SectionLabel>Marshal Dashboard</SectionLabel>
        <SectionTitle>
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
        </SectionTitle>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {[
            { title: "Available Jobs", value: jobs.length, color: C.accent },
            { title: "Pending Apps", value: pendingApps, color: C.orange },
            { title: "Accepted", value: acceptedApps, color: C.green },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: C.s2,
                borderRadius: 14,
                padding: "18px 20px",
                border: "1px solid " + C.b1,
              }}
            >
              <div style={{ fontSize: 11, color: C.t4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: C.s2,
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
            border: "1px solid " + C.b1,
          }}
        >
          {[
            { key: "jobs", label: "Available Jobs" },
            { key: "applications", label: `My Applications (${myApps.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                padding: "11px",
                background: tab === t.key ? C.s3 : "transparent",
                color: tab === t.key ? C.t1 : C.t4,
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: C.t3 }}>Loading...</div>
        ) : tab === "jobs" ? (
          <>
            {jobs.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  background: C.s2,
                  borderRadius: 20,
                  border: "1px solid " + C.b1,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{"\ud83d\udcad"}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.t2 }}>No jobs posted yet</div>
                <p style={{ fontSize: 13, color: C.t4, marginTop: 6 }}>
                  New jobs will appear here as managers post them.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} linkTo={`/job/${job.id}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {myApps.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  background: C.s2,
                  borderRadius: 20,
                  border: "1px solid " + C.b1,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>{"\ud83d\udceb"}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.t2 }}>No applications yet</div>
                <p style={{ fontSize: 13, color: C.t4, marginTop: 6 }}>
                  Apply to jobs from the Available Jobs tab.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myApps.map((app) => (
                  <Link
                    key={app.id}
                    to={`/job/${app.job_id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      className="card-hover"
                      style={{
                        background: C.s2,
                        borderRadius: 16,
                        padding: 22,
                        border: "1px solid " + C.b1,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: C.t1, marginBottom: 4 }}>
                            {app.jobs?.title || "Unknown Job"}
                          </div>
                          <div style={{ fontSize: 12, color: C.t3 }}>
                            {app.jobs?.location && `\ud83d\udccd ${app.jobs.location}`}
                            {app.jobs?.date && ` \u00b7 \ud83d\udcc5 ${new Date(app.jobs.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                            {app.jobs?.day_rate && ` \u00b7 \u00a3${app.jobs.day_rate}`}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: 8,
                            background: (statusColors[app.status] || C.t4) + "18",
                            color: statusColors[app.status] || C.t4,
                            textTransform: "uppercase",
                            flexShrink: 0,
                          }}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
}
