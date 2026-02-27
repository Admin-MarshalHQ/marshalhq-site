import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { C } from "../../lib/theme";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import { Section, SectionLabel, SectionTitle } from "../../components/ui/Section";

export default function JobApplicants() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);

    try {
      // Fetch job
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("posted_by", user.id)
        .single();

      if (jobError || !jobData) {
        console.error("Error fetching job:", jobError?.message);
        setLoading(false);
        return;
      }
      setJob(jobData);

      // Fetch applications with applicant profiles
      const { data: apps, error: appsError } = await supabase
        .from("applications")
        .select("*, profiles:applicant_id(full_name, location, avg_rating, total_jobs, reliability_pct, has_sia, has_cscs, has_first_aid, has_own_transport, day_rate_min, day_rate_max)")
        .eq("job_id", id)
        .order("applied_at", { ascending: true });

      if (appsError) console.error("Error fetching applicants:", appsError.message);
      setApplicants(apps || []);
    } catch (err) {
      console.error("Job applicants fetch error:", err);
    }

    setLoading(false);
  };

  const updateStatus = async (applicationId, newStatus) => {
    setUpdating(applicationId);

    // Re-fetch job to get latest slots_filled (prevents race condition)
    if (newStatus === "accepted") {
      const { data: freshJob } = await supabase
        .from("jobs")
        .select("slots_filled, slots_needed")
        .eq("id", id)
        .single();

      if (freshJob && freshJob.slots_filled >= freshJob.slots_needed) {
        setUpdating(null);
        alert("All slots have already been filled.");
        await fetchData(); // refresh to show updated state
        return;
      }
    }

    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", applicationId);

    if (!error) {
      // Update local state
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a))
      );

      // If accepting, increment slots_filled
      if (newStatus === "accepted") {
        const newFilled = (job.slots_filled || 0) + 1;
        await supabase
          .from("jobs")
          .update({ slots_filled: newFilled })
          .eq("id", id);
        setJob((prev) => ({ ...prev, slots_filled: newFilled }));
      }
    }

    setUpdating(null);
  };

  const certBadge = (has, label) => {
    if (!has) return null;
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          padding: "3px 8px",
          borderRadius: 6,
          background: "#10b98118",
          color: C.green,
        }}
      >
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
        <Navbar />
        <Section style={{ paddingTop: 100, textAlign: "center" }}>
          <p style={{ color: C.t3 }}>Loading...</p>
        </Section>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
        <Navbar />
        <Section style={{ paddingTop: 100, textAlign: "center" }}>
          <p style={{ color: C.t3 }}>Job not found or you don't have access.</p>
          <Link to="/manager/dashboard" style={{ color: C.accent, fontSize: 14 }}>
            Back to Dashboard
          </Link>
        </Section>
      </div>
    );
  }

  const slotsRemaining = job.slots_needed - job.slots_filled;
  const pendingCount = applicants.filter((a) => a.status === "pending").length;
  const acceptedCount = applicants.filter((a) => a.status === "accepted").length;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
      <Navbar />
      <Section style={{ paddingTop: 100, maxWidth: 800 }}>
        <Link
          to="/manager/dashboard"
          style={{ fontSize: 13, color: C.t4, textDecoration: "none", marginBottom: 16, display: "inline-block" }}
        >
          &larr; Back to Dashboard
        </Link>

        {/* Job summary */}
        <div style={{ marginBottom: 32 }}>
          <SectionLabel>Applicants</SectionLabel>
          <SectionTitle>{job.title}</SectionTitle>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: C.t3 }}>
            <span>{"\ud83d\udccd"} {job.location}</span>
            <span>{"\ud83d\udcc5"} {new Date(job.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            <span>{"\ud83d\udcb7"} &pound;{job.day_rate}/day</span>
            <span>{"\ud83d\udc65"} {slotsRemaining} of {job.slots_needed} slots remaining</span>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          <div style={{ background: C.s2, borderRadius: 12, padding: "12px 20px", border: "1px solid " + C.b1, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.t1 }}>{applicants.length}</div>
            <div style={{ fontSize: 11, color: C.t4 }}>Total</div>
          </div>
          <div style={{ background: C.s2, borderRadius: 12, padding: "12px 20px", border: "1px solid " + C.b1, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.orange }}>{pendingCount}</div>
            <div style={{ fontSize: 11, color: C.t4 }}>Pending</div>
          </div>
          <div style={{ background: C.s2, borderRadius: 12, padding: "12px 20px", border: "1px solid " + C.b1, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.green }}>{acceptedCount}</div>
            <div style={{ fontSize: 11, color: C.t4 }}>Accepted</div>
          </div>
        </div>

        {/* Applicant list */}
        {applicants.length === 0 ? (
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
            <div style={{ fontSize: 16, fontWeight: 700, color: C.t2 }}>No applicants yet</div>
            <p style={{ fontSize: 13, color: C.t4, marginTop: 6 }}>
              Applicants will appear here when marshals apply for this job.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {applicants.map((app) => {
              const p = app.profiles;
              const statusColor =
                app.status === "accepted" ? C.green : app.status === "declined" ? C.red : C.orange;

              return (
                <div
                  key={app.id}
                  style={{
                    background: C.s2,
                    borderRadius: 16,
                    padding: 24,
                    border: "1px solid " + C.b1,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 16 }}>
                    {/* Applicant info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: C.t1 }}>
                          {p?.full_name || "Unknown"}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: statusColor + "18",
                            color: statusColor,
                            textTransform: "uppercase",
                          }}
                        >
                          {app.status}
                        </span>
                      </div>

                      {p?.location && (
                        <div style={{ fontSize: 13, color: C.t3, marginBottom: 6 }}>
                          {"\ud83d\udccd"} {p.location}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                        {p?.avg_rating > 0 && (
                          <span style={{ fontSize: 12, color: C.t3 }}>
                            {"\u2b50"} {p.avg_rating} rating
                          </span>
                        )}
                        {p?.total_jobs > 0 && (
                          <span style={{ fontSize: 12, color: C.t3 }}>
                            {p.total_jobs} jobs done
                          </span>
                        )}
                        {p?.reliability_pct > 0 && (
                          <span style={{ fontSize: 12, color: C.t3 }}>
                            {p.reliability_pct}% reliable
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {certBadge(p?.has_sia, "SIA")}
                        {certBadge(p?.has_cscs, "CSCS")}
                        {certBadge(p?.has_first_aid, "First Aid")}
                        {certBadge(p?.has_own_transport, "Own Transport")}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {app.status === "pending" && slotsRemaining > 0 && (
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button
                          onClick={() => updateStatus(app.id, "accepted")}
                          disabled={updating === app.id}
                          style={{
                            padding: "10px 20px",
                            background: C.green,
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            opacity: updating === app.id ? 0.6 : 1,
                          }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, "declined")}
                          disabled={updating === app.id}
                          style={{
                            padding: "10px 20px",
                            background: "transparent",
                            color: C.red,
                            border: "1px solid " + C.red + "44",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            opacity: updating === app.id ? 0.6 : 1,
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}
