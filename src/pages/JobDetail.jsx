import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { C } from "../lib/theme";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { Section, SectionLabel } from "../components/ui/Section";
import { Loading, ErrorState } from "../components/StateView";
import { enqueueNotification } from "../lib/notify";

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
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

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

    // Fetch poster profile (public fields only)
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

        // Only fetch poster contact info if accepted
        if (appData.status === "accepted") {
          const { data: contactData } = await supabase
            .from("profiles")
            .select("phone, email")
            .eq("id", jobData.posted_by)
            .single();
          if (contactData) {
            setPoster((prev) => ({ ...prev, ...contactData }));
          }
        }
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
      ...(message.trim() && { message: message.trim() }),
    });

    if (applyError) {
      setError(applyError.message);
    } else {
      setApplied(true);
      setApplicationStatus("pending");
      enqueueNotification({
        recipientId: job.posted_by,
        actorId: user.id,
        type: "application_received",
        jobId: id,
      });
    }

    setApplying(false);
  };

  const backPath = profile?.role === "manager" ? "/manager/dashboard" : "/marshal/dashboard";

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
        <Navbar />
        <Section style={{ paddingTop: 100 }}>
          <Loading label="Loading job..." />
        </Section>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
        <Navbar />
        <Section style={{ paddingTop: 100 }}>
          <ErrorState message={error || "Job not found."} onRetry={fetchJob} />
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Link to={backPath} style={{ color: C.accent, fontSize: 14 }}>
              Back to Dashboard
            </Link>
          </div>
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
    withdrawn: C.t4,
  };

  const handleWithdraw = async () => {
    if (!window.confirm("Withdraw your application?")) return;
    const { error: wErr } = await supabase
      .from("applications")
      .update({ status: "withdrawn" })
      .eq("job_id", id)
      .eq("applicant_id", user.id);
    if (!wErr) {
      setApplied(false);
      setApplicationStatus(null);
      setMessage("");
      setShowMessage(false);
    }
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
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.t1, margin: "0 0 8px", letterSpacing: -0.5 }}>
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
                <div style={{ fontSize: 16, fontWeight: 700, color: statusColors[applicationStatus], marginBottom: 4 }}>
                  {applicationStatus === "pending" && "Application Submitted"}
                  {applicationStatus === "accepted" && "You\u2019re Booked!"}
                  {applicationStatus === "declined" && "Application Declined"}
                </div>
                <div style={{ fontSize: 13, color: C.t3 }}>
                  {applicationStatus === "pending" && "The manager will review your application shortly."}
                  {applicationStatus === "accepted" && "You\u2019ve been accepted for this job."}
                  {applicationStatus === "declined" && "Unfortunately, the manager chose other applicants for this job."}
                </div>
                {applicationStatus === "accepted" && (poster?.phone || poster?.email) && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      background: C.green + "10",
                      border: "1px solid " + C.green + "33",
                      borderRadius: 10,
                      fontSize: 13,
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ color: C.t2, fontWeight: 600 }}>Contact {poster.full_name}:</span>
                    {poster.phone && (
                      <a href={`tel:${poster.phone}`} style={{ color: C.green, textDecoration: "none", fontWeight: 600 }}>
                        {poster.phone}
                      </a>
                    )}
                    {poster.email && (
                      <a href={`mailto:${poster.email}`} style={{ color: C.green, textDecoration: "none", fontWeight: 600 }}>
                        {poster.email}
                      </a>
                    )}
                  </div>
                )}
                {applicationStatus === "pending" && (
                  <button
                    onClick={handleWithdraw}
                    style={{
                      marginTop: 12,
                      padding: "8px 20px",
                      background: "transparent",
                      color: C.red,
                      border: "1px solid " + C.red + "44",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Withdraw Application
                  </button>
                )}
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
                <div style={{ marginBottom: 14 }}>
                  <button
                    onClick={() => setShowMessage(!showMessage)}
                    style={{
                      background: "none",
                      border: "none",
                      color: C.accent,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      padding: 0,
                    }}
                  >
                    {showMessage ? "Hide message" : "Add a message (optional)"}
                  </button>
                  {showMessage && (
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Introduce yourself or mention relevant experience..."
                      maxLength={500}
                      style={{
                        width: "100%",
                        marginTop: 10,
                        padding: 14,
                        background: C.s2,
                        color: C.t1,
                        border: "1px solid " + C.b1,
                        borderRadius: 12,
                        fontSize: 14,
                        fontFamily: "inherit",
                        resize: "vertical",
                        minHeight: 80,
                        outline: "none",
                      }}
                    />
                  )}
                </div>
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="cta-btn"
                  style={{
                    width: "100%",
                    padding: "18px",
                    background: C.green,
                    color: C.bg,
                    border: "none",
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: applying ? "not-allowed" : "pointer",
                    opacity: applying ? 0.7 : 1,
                    fontFamily: "inherit",
                    letterSpacing: 0.5,
                  }}
                >
                  {applying ? "Applying..." : "Apply Now"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Review prompt for completed jobs */}
        {profile?.role === "marshal" && job.status === "completed" && applicationStatus === "accepted" && (
          <div
            style={{
              marginBottom: 40,
              padding: "20px 24px",
              background: C.accent + "10",
              border: "1px solid " + C.accent + "33",
              borderRadius: 16,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: C.accent, marginBottom: 4 }}>
              Job Completed
            </div>
            <p style={{ fontSize: 13, color: C.t3, marginBottom: 12 }}>
              How was working with {poster?.full_name || "the manager"}?
            </p>
            <Link
              to={`/review/${id}/${job.posted_by}`}
              className="cta-btn"
              style={{
                display: "inline-block",
                padding: "12px 28px",
                background: C.accent,
                color: C.bg,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: 0.5,
              }}
            >
              Leave a Review
            </Link>
          </div>
        )}
      </Section>
    </div>
  );
}
