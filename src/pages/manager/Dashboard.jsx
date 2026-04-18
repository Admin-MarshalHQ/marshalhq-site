import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { C } from "../../lib/theme";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import JobCard from "../../components/JobCard";
import { Section, SectionLabel, SectionTitle } from "../../components/ui/Section";
import { Loading, Empty, ErrorState } from "../../components/StateView";

export default function ManagerDashboard() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pendingReviews, setPendingReviews] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    setLoadError(null);

    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("posted_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);

      // Pending reviews: completed jobs where I have accepted marshals I haven't reviewed.
      const completedIds = (data || [])
        .filter((j) => j.status === "completed")
        .map((j) => j.id);
      if (completedIds.length > 0) {
        const [{ data: acceptedApps }, { data: myReviews }] = await Promise.all([
          supabase
            .from("applications")
            .select("job_id, applicant_id, profiles:applicant_id(full_name)")
            .in("job_id", completedIds)
            .eq("status", "accepted"),
          supabase
            .from("reviews")
            .select("job_id, reviewed_user_id")
            .eq("reviewer_id", user.id)
            .in("job_id", completedIds),
        ]);
        const reviewed = new Set(
          (myReviews || []).map((r) => `${r.job_id}:${r.reviewed_user_id}`)
        );
        setPendingReviews(
          (acceptedApps || []).filter(
            (a) => !reviewed.has(`${a.job_id}:${a.applicant_id}`)
          )
        );
      } else {
        setPendingReviews([]);
      }
    } catch (err) {
      console.error("Manager dashboard fetch error:", err);
      setLoadError(err?.message || "Could not load your jobs.");
    }

    setLoading(false);
  };

  const liveJobs = jobs.filter((j) => j.status === "live");
  const pastJobs = jobs.filter((j) => ["filled", "completed", "cancelled"].includes(j.status));

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
            { title: "Active Jobs", value: liveJobs.length, color: C.accent },
            { title: "Total Posted", value: jobs.length, color: C.orange },
            { title: "Completed", value: pastJobs.length, color: C.green },
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

        {/* Pending reviews strip */}
        {pendingReviews.length > 0 && (
          <div
            style={{
              background: C.accent + "10",
              border: "1px solid " + C.accent + "44",
              borderRadius: 14,
              padding: "14px 18px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 2 }}>
                {pendingReviews.length === 1
                  ? `Review ${pendingReviews[0].profiles?.full_name || "your marshal"}`
                  : `${pendingReviews.length} marshals waiting for your review`}
              </div>
              <div style={{ fontSize: 12, color: C.t3 }}>
                Rate the marshals you booked on completed jobs.
              </div>
            </div>
            <Link
              to={`/review/${pendingReviews[0].job_id}/${pendingReviews[0].applicant_id}`}
              style={{
                padding: "10px 20px",
                background: C.accent,
                color: C.bg,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: 0.5,
                whiteSpace: "nowrap",
              }}
            >
              Leave review
            </Link>
          </div>
        )}

        {/* Job list */}
        {loading ? (
          <Loading />
        ) : loadError ? (
          <ErrorState message={loadError} onRetry={fetchJobs} />
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
            {liveJobs.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                  Active Jobs
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {liveJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      linkTo={`/manager/job/${job.id}`}
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
