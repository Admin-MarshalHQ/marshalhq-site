import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { C } from "../../lib/theme";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import JobCard from "../../components/JobCard";
import { Section, SectionLabel, SectionTitle } from "../../components/ui/Section";
import { Loading, Empty, ErrorState } from "../../components/StateView";

export default function MarshalDashboard() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [tab, setTab] = useState("jobs");
  const [filters, setFilters] = useState({ search: "", minRate: "", dateFrom: "", dateTo: "", nearMe: false });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setLoadError(null);

    try {
      // Fetch live jobs
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "live")
        .order("is_urgent", { ascending: false })
        .order("created_at", { ascending: false });

      if (jobError) throw jobError;
      setJobs(jobData || []);

      // Fetch my applications with job data
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .select("*, jobs(*)")
        .eq("applicant_id", user.id)
        .order("applied_at", { ascending: false });

      if (appError) throw appError;
      setMyApps(appData || []);

      // Pending reviews: accepted on a completed job where I haven't yet reviewed the manager.
      const completedAccepted = (appData || []).filter(
        (a) => a.status === "accepted" && a.jobs?.status === "completed"
      );
      if (completedAccepted.length > 0) {
        const jobIds = completedAccepted.map((a) => a.job_id);
        const { data: myReviews } = await supabase
          .from("reviews")
          .select("job_id, reviewed_user_id")
          .eq("reviewer_id", user.id)
          .in("job_id", jobIds);
        const reviewed = new Set(
          (myReviews || []).map((r) => `${r.job_id}:${r.reviewed_user_id}`)
        );
        setPendingReviews(
          completedAccepted.filter(
            (a) => !reviewed.has(`${a.job_id}:${a.jobs?.posted_by}`)
          )
        );
      } else {
        setPendingReviews([]);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setLoadError(err?.message || "Could not load your dashboard.");
    }

    setLoading(false);
  };

  const pendingApps = myApps.filter((a) => a.status === "pending").length;
  const acceptedApps = myApps.filter((a) => a.status === "accepted").length;

  const statusColors = { pending: C.orange, accepted: C.green, declined: C.red, withdrawn: C.t4 };
  const activeApps = myApps.filter((a) => a.status !== "withdrawn");

  const hasFilters =
    filters.search || filters.minRate || filters.dateFrom || filters.dateTo || filters.nearMe;

  const myLocationTokens = (profile?.location || "")
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);

  const filteredJobs = jobs.filter((j) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !j.title?.toLowerCase().includes(q) &&
        !j.location?.toLowerCase().includes(q) &&
        !j.production_name?.toLowerCase().includes(q)
      ) return false;
    }
    if (filters.minRate && j.day_rate < Number(filters.minRate)) return false;
    if (filters.dateFrom && j.date < filters.dateFrom) return false;
    if (filters.dateTo && j.date > filters.dateTo) return false;
    if (filters.nearMe) {
      if (myLocationTokens.length === 0) return false;
      const loc = (j.location || "").toLowerCase();
      if (!myLocationTokens.some((t) => loc.includes(t))) return false;
    }
    return true;
  });

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
            { title: "Available Jobs", value: hasFilters ? `${filteredJobs.length} / ${jobs.length}` : jobs.length, color: C.accent },
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
                  ? "1 review waiting"
                  : `${pendingReviews.length} reviews waiting`}
              </div>
              <div style={{ fontSize: 12, color: C.t3 }}>
                Rate the {pendingReviews.length === 1 ? "manager" : "managers"} you worked with.
              </div>
            </div>
            <Link
              to={`/review/${pendingReviews[0].job_id}/${pendingReviews[0].jobs?.posted_by}`}
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
            { key: "applications", label: `My Applications (${activeApps.length})` },
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

        {/* Filters (jobs tab only) */}
        {tab === "jobs" && (
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: "none",
                border: "none",
                color: hasFilters ? C.accent : C.t4,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                padding: 0,
                marginBottom: showFilters ? 12 : 0,
              }}
            >
              {showFilters ? "Hide filters" : "Filter jobs"}
              {hasFilters && !showFilters && " (active)"}
            </button>
            {showFilters && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 10,
                  background: C.s2,
                  borderRadius: 14,
                  padding: 16,
                  border: "1px solid " + C.b1,
                }}
              >
                <input
                  type="text"
                  placeholder="Search title, location..."
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  style={{
                    gridColumn: "1 / -1",
                    padding: "10px 14px",
                    background: C.s3,
                    color: C.t1,
                    border: "1px solid " + C.b1,
                    borderRadius: 10,
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                <div>
                  <div style={{ fontSize: 11, color: C.t4, fontWeight: 600, marginBottom: 4 }}>Min rate</div>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={filters.minRate}
                    onChange={(e) => setFilters((f) => ({ ...f, minRate: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: C.s3,
                      color: C.t1,
                      border: "1px solid " + C.b1,
                      borderRadius: 10,
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.t4, fontWeight: 600, marginBottom: 4 }}>From date</div>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: C.s3,
                      color: C.t1,
                      border: "1px solid " + C.b1,
                      borderRadius: 10,
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                      colorScheme: "dark",
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.t4, fontWeight: 600, marginBottom: 4 }}>To date</div>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: C.s3,
                      color: C.t1,
                      border: "1px solid " + C.b1,
                      borderRadius: 10,
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                      colorScheme: "dark",
                    }}
                  />
                </div>
                <label
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: filters.nearMe ? C.accent : C.t3,
                    cursor: profile?.location ? "pointer" : "not-allowed",
                    userSelect: "none",
                  }}
                  title={
                    profile?.location
                      ? `Filter to jobs whose location mentions "${profile.location}"`
                      : "Set a location on your profile to use this filter"
                  }
                >
                  <input
                    type="checkbox"
                    checked={filters.nearMe}
                    disabled={!profile?.location}
                    onChange={(e) => setFilters((f) => ({ ...f, nearMe: e.target.checked }))}
                    style={{ accentColor: C.accent, cursor: "inherit" }}
                  />
                  Near me{profile?.location ? ` (${profile.location})` : ""}
                </label>
                {hasFilters && (
                  <button
                    onClick={() => setFilters({ search: "", minRate: "", dateFrom: "", dateTo: "", nearMe: false })}
                    style={{
                      background: "none",
                      border: "none",
                      color: C.red,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      padding: "8px 0",
                      textAlign: "left",
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <Loading />
        ) : loadError ? (
          <ErrorState message={loadError} onRetry={fetchData} />
        ) : tab === "jobs" ? (
          <>
            {filteredJobs.length === 0 ? (
              <Empty
                title={hasFilters ? "No jobs match your filters" : "No jobs posted yet"}
                hint={
                  hasFilters
                    ? "Try adjusting your search criteria."
                    : "New jobs will appear here as managers post them."
                }
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} linkTo={`/job/${job.id}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {activeApps.length === 0 ? (
              <Empty
                title="No applications yet"
                hint="Apply to jobs from the Available Jobs tab."
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeApps.map((app) => (
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
                          <div style={{ fontSize: 16, fontWeight: 700, color: C.t1, marginBottom: 4 }}>
                            {app.jobs?.title || "Unknown Job"}
                          </div>
                          <div style={{ fontSize: 12, color: C.t3 }}>
                            {app.jobs?.location && `\ud83d\udccd ${app.jobs.location}`}
                            {app.jobs?.date && ` \u00b7 \ud83d\udcc5 ${new Date(app.jobs.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
                            {app.jobs?.day_rate && ` \u00b7 \u00a3${app.jobs.day_rate}`}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                          {app.status === "accepted" && app.jobs?.status === "completed" && (
                            <Link
                              to={`/review/${app.job_id}/${app.jobs.posted_by}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: C.accent,
                                textDecoration: "none",
                                padding: "4px 10px",
                                borderRadius: 8,
                                background: C.accent + "18",
                              }}
                            >
                              Review
                            </Link>
                          )}
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "4px 10px",
                              borderRadius: 8,
                              background: (statusColors[app.status] || C.t4) + "18",
                              color: statusColors[app.status] || C.t4,
                              textTransform: "uppercase",
                            }}
                          >
                            {app.status}
                          </span>
                        </div>
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
