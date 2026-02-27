import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { C } from "../lib/theme";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { Section, SectionLabel } from "../components/ui/Section";

export default function JobDetail() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [job, setJob] = useState(null);
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);

    // Fetch job
    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (jobError || !jobData) {
      setError("Job not found.");
      setLoading(false);
      return;
    }
    setJob(jobData);

    // Fetch poster profile
    const { data: posterData } = await supabase
      .from("profiles")
      .select("full_name, avg_rating, total_jobs")
      .eq("id", jobData.posted_by)
      .single();
    setPoster(posterData);

    // Check if current user already applied
    if (user) {
      const { data: appData } = await supabase
        .from("applications")
        .select("status")
        .eq("job_id", id)
        .eq("applicant_id", user.id)
        .single();

      if (appData) {
        setApplied(true);
        setApplicationStatus(appData.status);
      }
    }

    setLoading(false);
  };

  const handleApply = async () => {
    setApplying(true);
    setError(null);

    const { error: applyError } = await supabase.from("applications").insert({
      job_id: id,
      applicant_id: user.id,
    });

    if (applyError) {
      setError(applyError.message);
    } else {
      setApplied(true);
      setApplicationStatus("pending");
    }

    setApplying(false);
  };

  const backPath = profile?.role === "manager" ? "/manager/dashboard" : "/marshal/dashboard";

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
        <Navbar />
        <Section style={{ paddingTop: 100, textAlign: "center" }}>
          <p style={{ color: C.t3 }}>Loading job...</p>
        </Section>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
        <Navbar />
        <Section style={{ paddingTop: 100, textAlign: "center" }}>
          <p style={{ color: C.t3 }}>{error || "Job not found."}</p>
          <Link to={backPath} style={{ color: C.accent, fontSize: 14 }}>
            Back to Dashboard
          </Link>
        </Section>
      </div>
    );
  }

  const slotsRemaining = job.slots_needed - job.slots_filled;
  const dateFormatted = new Date(job.date + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statusColors = {
    pending: C.orange,
    accepted: C.green,
    declined: C.red,
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
      <Navbar />
      <Section style={{ paddingTop: 100, maxWidth: 720 }}>
        <Link
          to={backPath}
          style={{ fontSize: 13, color: C.t4, textDecoration: "none", marginBottom: 16, display: "inline-block" }}
        >
          &larr; Back to Dashboard
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
            {job.is_urgent && (
              <span
                style={{
                  background: "#ef444420",
                  color: C.red,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 8,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Urgent
              </span>
            )}
            {job.status !== "live" && (
              <span
                style={{
                  background: C.s3,
                  color: C.t4,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 8,
                  textTransform: "uppercase",
                }}
              >
                {job.status}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: C.t1, margin: "0 0 8px", letterSpacing: -0.5 }}>
            {job.title}
          </h1>
          {job.production_name && (
            <div style={{ fontSize: 14, color: C.accent, fontWeight: 600 }}>{job.production_name}</div>
          )}
        </div>

        {/* Info grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginBottom: 28,
          }}
        >
          {[
            { label: "Location", value: job.location, icon: "\ud83d\udccd" },
            { label: "Date", value: dateFormatted, icon: "\ud83d\udcc5" },
            { label: "Time", value: `${job.start_time} \u2013 ${job.end_time}`, icon: "\u23f0" },
            { label: "Day Rate", value: `\u00a3${job.day_rate}`, icon: "\ud83d\udcb7" },
            { label: "Slots", value: `${slotsRemaining} of ${job.slots_needed} remaining`, icon: "\ud83d\udc65" },
            { label: "Posted by", value: poster?.full_name || "Unknown", icon: "\ud83c\udfac" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: C.s2,
                borderRadius: 14,
                padding: "16px 18px",
                border: "1px solid " + C.b1,
              }}
            >
              <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 11, color: C.t4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        {job.description && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Description
            </div>
            <div
              style={{
                background: C.s2,
                borderRadius: 16,
                padding: 24,
                border: "1px solid " + C.b1,
                fontSize: 14,
                color: C.t2,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {job.description}
            </div>
          </div>
        )}

        {/* Requirements */}
        {job.requirements && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Requirements
            </div>
            <div
              style={{
                background: C.s2,
                borderRadius: 16,
                padding: 24,
                border: "1px solid " + C.b1,
                fontSize: 14,
                color: C.t2,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {job.requirements}
            </div>
          </div>
        )}

        {/* Apply button (marshal only) */}
        {profile?.role === "marshal" && job.status === "live" && (
          <div style={{ marginBottom: 40 }}>
            {applied ? (
              <div
                style={{
                  padding: "20px 24px",
                  background: statusColors[applicationStatus] + "15",
                  border: "1px solid " + statusColors[applicationStatus] + "33",
                  borderRadius: 16,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color: statusColors[applicationStatus], marginBottom: 4 }}>
                  {applicationStatus === "pending" && "Application Submitted"}
                  {applicationStatus === "accepted" && "You\u2019re Booked!"}
                  {applicationStatus === "declined" && "Application Declined"}
                </div>
                <div style={{ fontSize: 13, color: C.t3 }}>
                  {applicationStatus === "pending" && "The manager will review your application shortly."}
                  {applicationStatus === "accepted" && "You\u2019ve been accepted for this job. Contact the manager to confirm details."}
                  {applicationStatus === "declined" && "Unfortunately, the manager chose other applicants for this job."}
                </div>
              </div>
            ) : slotsRemaining <= 0 ? (
              <div
                style={{
                  padding: "20px 24px",
                  background: C.s2,
                  border: "1px solid " + C.b1,
                  borderRadius: 16,
                  textAlign: "center",
                  color: C.t4,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                All slots have been filled
              </div>
            ) : (
              <>
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
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="cta-btn"
                  style={{
                    width: "100%",
                    padding: "18px",
                    background: "linear-gradient(135deg,#10b981,#059669)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    fontSize: 17,
                    fontWeight: 800,
                    cursor: applying ? "not-allowed" : "pointer",
                    opacity: applying ? 0.7 : 1,
                    fontFamily: "inherit",
                    boxShadow: "0 4px 20px #10b98144",
                  }}
                >
                  {applying ? "Applying..." : "Apply Now"}
                </button>
              </>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}
