import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { C } from "../../lib/theme";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import JobCard from "../../components/JobCard";
import { Section, SectionLabel, SectionTitle } from "../../components/ui/Section";

export default function ManagerDashboard() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("posted_by", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching jobs:", error.message);
        setJobs([]);
        setError(error.message);
        return;
      }

      setJobs(data || []);
    } catch (err) {
      console.error("Manager dashboard fetch error:", err);
      setJobs([]);
      setError(err.message || "Unable to load your jobs right now.");
    } finally {
      setLoading(false);
    }
  };

  const openJobs = jobs.filter((j) => j.status === "live");
  const filledJobs = jobs.filter((j) => j.status === "filled");
  const activeJobs = jobs.filter((j) => ["live", "filled"].includes(j.status));
  const completedJobs = jobs.filter((j) => j.status === "completed");
  const pastJobs = jobs.filter((j) => ["completed", "cancelled"].includes(j.status));

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
      <Navbar />
      <Section style={{ paddingTop: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <SectionLabel>Manager Dashboard</SectionLabel>
            <SectionTitle>
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
            </SectionTitle>
          </div>
          <Link
            to="/manager/post"
            className="cta-btn"
            style={{
              background: C.accent,
              color: C.bg,
              border: "none",
              padding: "14px 28px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "none",
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
            }}
          >
            + Post a Job
          </Link>
        </div>

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
            { title: "Active Jobs", value: activeJobs.length, color: C.accent },
            { title: "Total Posted", value: jobs.length, color: C.orange },
            { title: "Completed", value: completedJobs.length, color: C.green },
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
              <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Job list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: C.t3 }}>Loading...</div>
        ) : error ? (
          <div
            style={{
              padding: 24,
              background: "#ef444415",
              borderRadius: 20,
              border: "1px solid #ef444433",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: C.red, marginBottom: 8 }}>
              Unable to load jobs
            </div>
            <p style={{ fontSize: 14, color: C.t3, maxWidth: 460, margin: "0 auto" }}>
              {error}
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div
            style={{
              padding: 48,
              background: C.s2,
              borderRadius: 20,
              border: "1px solid " + C.b1,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: C.t1, marginBottom: 8 }}>
              Post your first job
            </div>
            <p style={{ fontSize: 14, color: C.t3, maxWidth: 400, margin: "0 auto 24px" }}>
              Create a job posting and marshals will be able to apply immediately.
            </p>
            <Link
              to="/manager/post"
              className="cta-btn"
              style={{
                display: "inline-block",
                background: C.accent,
                color: C.bg,
                padding: "14px 28px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: 0.5,
              }}
            >
              + Post a Job
            </Link>
          </div>
        ) : (
          <>
            {openJobs.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                  Open Jobs
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {openJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      linkTo={`/manager/job/${job.id}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {filledJobs.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                  Filled Jobs
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filledJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      linkTo={`/manager/job/${job.id}`}
                      showSlots={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {pastJobs.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.t4, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                  Past Jobs
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pastJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      linkTo={`/manager/job/${job.id}`}
                      showSlots={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
}
