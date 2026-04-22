import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { C } from "../../lib/theme";
import { useAuth } from "../../lib/AuthContext";
import {
  acceptApplication,
  cancelJob,
  completeJob,
  declineApplication,
  fetchJobApplicantContacts,
  fetchPublicProfiles,
  mapRowsById,
} from "../../lib/api";
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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("posted_by", user.id)
        .single();

      if (jobError || !jobData) {
        setJob(null);
        setApplicants([]);
        setLoading(false);
        return;
      }

      setJob(jobData);

      const { data: apps, error: appsError } = await supabase
        .from("applications")
        .select("id, job_id, applicant_id, status, message, applied_at")
        .eq("job_id", id)
        .order("applied_at", { ascending: true });

      if (appsError) {
        throw appsError;
      }

      const applicantIds = (apps || []).map((app) => app.applicant_id);
      const { data: publicProfiles, error: profileError } = await fetchPublicProfiles(applicantIds);

      if (profileError) {
        console.error("Error fetching applicant public profiles:", profileError.message);
      }

      const { data: contacts, error: contactError } = await fetchJobApplicantContacts(id);

      if (contactError) {
        console.error("Error fetching applicant contacts:", contactError.message);
      }

      const profileMap = mapRowsById(publicProfiles || []);
      const contactMap = mapRowsById(contacts || []);

      setApplicants(
        (apps || []).map((app) => ({
          ...app,
          profile: {
            ...(profileMap[app.applicant_id] || {}),
            ...(contactMap[app.applicant_id] || {}),
          },
        }))
      );
    } catch (err) {
      console.error("Job applicants fetch error:", err);
      setError(err.message || "Could not load applicants.");
    }

    setLoading(false);
  };

  const handleApplicationAction = async (applicationId, newStatus) => {
    setUpdating(applicationId);
    setError(null);

    const action = newStatus === "accepted" ? acceptApplication : declineApplication;
    const { error: actionError } = await action(applicationId);

    if (actionError) {
      setError(actionError.message);
      setUpdating(null);
      return;
    }

    await fetchData();
    setUpdating(null);
  };

  const handleCancelJob = async () => {
    if (!window.confirm("Cancel this job? Marshals will no longer be able to apply.")) return;

    setUpdating("cancel-job");
    setError(null);

    const { error: cancelError } = await cancelJob(id);

    if (cancelError) {
      setError(cancelError.message);
      setUpdating(null);
      return;
    }

    await fetchData();
    setUpdating(null);
  };

  const handleCompleteJob = async () => {
    if (!window.confirm("Mark this job as completed?")) return;

    setUpdating("complete-job");
    setError(null);

    const { error: completeError } = await completeJob(id);

    if (completeError) {
      setError(completeError.message);
      setUpdating(null);
      return;
    }

    await fetchData();
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
  const canCancelJob = !["completed", "cancelled"].includes(job.status);
  const canCompleteJob = ["live", "filled"].includes(job.status) && acceptedCount > 0;
  const statusTone =
    job.status === "completed" ? C.green : job.status === "cancelled" ? C.red : C.orange;

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

        <div style={{ marginBottom: 32 }}>
          <SectionLabel>Applicants</SectionLabel>
          <SectionTitle>{job.title}</SectionTitle>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: C.t3, marginBottom: 12 }}>
            <span>{"\ud83d\udccd"} {job.location}</span>
            <span>{"\ud83d\udcc5"} {new Date(job.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            <span>{"\ud83d\udcb7"} &pound;{job.day_rate}/day</span>
            <span>{"\ud83d\udc65"} {slotsRemaining} of {job.slots_needed} slots remaining</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {job.status === "live" && (
              <Link
                to={`/manager/edit/${id}`}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.accent,
                  textDecoration: "none",
                }}
              >
                Edit Job
              </Link>
            )}
            {canCancelJob && (
              <button
                onClick={handleCancelJob}
                disabled={updating === "cancel-job"}
                style={{
                  background: "none",
                  border: "none",
                  color: C.red,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: 0,
                  opacity: updating === "cancel-job" ? 0.6 : 1,
                }}
              >
                Cancel Job
              </button>
            )}
            {canCompleteJob && (
              <button
                onClick={handleCompleteJob}
                disabled={updating === "complete-job"}
                style={{
                  background: "none",
                  border: "none",
                  color: C.green,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  padding: 0,
                  opacity: updating === "complete-job" ? 0.6 : 1,
                }}
              >
                Mark Complete
              </button>
            )}
          </div>

          {job.status !== "live" && (
            <div
              style={{
                display: "inline-block",
                marginTop: 8,
                padding: "4px 10px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                background: statusTone + "18",
                color: statusTone,
              }}
            >
              {job.status}
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "#ef444415",
              border: "1px solid #ef444433",
              borderRadius: 10,
              marginBottom: 16,
              fontSize: 13,
              color: C.red,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ background: C.s2, borderRadius: 12, padding: "12px 20px", border: "1px solid " + C.b1, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.t1 }}>{applicants.length}</div>
            <div style={{ fontSize: 11, color: C.t4 }}>Total</div>
          </div>
          <div style={{ background: C.s2, borderRadius: 12, padding: "12px 20px", border: "1px solid " + C.b1, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.orange }}>{pendingCount}</div>
            <div style={{ fontSize: 11, color: C.t4 }}>Pending</div>
          </div>
          <div style={{ background: C.s2, borderRadius: 12, padding: "12px 20px", border: "1px solid " + C.b1, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.green }}>{acceptedCount}</div>
            <div style={{ fontSize: 11, color: C.t4 }}>Accepted</div>
          </div>
        </div>

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
            <div style={{ fontSize: 18, fontWeight: 700, color: C.t2 }}>No applicants yet</div>
            <p style={{ fontSize: 13, color: C.t4, marginTop: 6 }}>
              Applicants will appear here when marshals apply for this job.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {applicants.map((app) => {
              const p = app.profile;
              const statusColor =
                app.status === "accepted"
                  ? C.green
                  : app.status === "declined"
                    ? C.red
                    : app.status === "withdrawn"
                      ? C.t4
                      : C.orange;

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
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: C.t1 }}>
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
                            {p.total_jobs} jobs reviewed
                          </span>
                        )}
                        {(p?.day_rate_min || p?.day_rate_max) && (
                          <span style={{ fontSize: 12, color: C.t3 }}>
                            &pound;{p.day_rate_min || 0}
                            {p.day_rate_max ? `-${p.day_rate_max}` : ""} expected
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {certBadge(p?.has_sia, "SIA")}
                        {certBadge(p?.has_cscs, "CSCS")}
                        {certBadge(p?.has_first_aid, "First Aid")}
                        {certBadge(p?.has_own_transport, "Own Transport")}
                      </div>

                      {app.message && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: "10px 14px",
                            background: C.s3,
                            borderRadius: 10,
                            fontSize: 13,
                            color: C.t3,
                            fontStyle: "italic",
                            lineHeight: 1.5,
                          }}
                        >
                          "{app.message}"
                        </div>
                      )}

                      {app.status === "accepted" && (p?.phone || p?.email) && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: "10px 14px",
                            background: C.green + "10",
                            border: "1px solid " + C.green + "33",
                            borderRadius: 10,
                            fontSize: 13,
                            display: "flex",
                            gap: 16,
                            flexWrap: "wrap",
                          }}
                        >
                          {p.phone && (
                            <a href={`tel:${p.phone}`} style={{ color: C.green, textDecoration: "none", fontWeight: 600 }}>
                              {p.phone}
                            </a>
                          )}
                          {p.email && (
                            <a href={`mailto:${p.email}`} style={{ color: C.green, textDecoration: "none", fontWeight: 600 }}>
                              {p.email}
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexShrink: 0, flexDirection: "column", alignItems: "flex-end" }}>
                      {app.status === "pending" && !["completed", "cancelled"].includes(job.status) && (
                        <div style={{ display: "flex", gap: 8 }}>
                          {job.status === "live" && slotsRemaining > 0 && (
                            <button
                              onClick={() => handleApplicationAction(app.id, "accepted")}
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
                          )}
                          <button
                            onClick={() => handleApplicationAction(app.id, "declined")}
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
                      {job.status === "completed" && app.status === "accepted" && (
                        <Link
                          to={`/review/${id}/${app.applicant_id}`}
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.accent,
                            textDecoration: "none",
                          }}
                        >
                          Leave Review
                        </Link>
                      )}
                    </div>
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
