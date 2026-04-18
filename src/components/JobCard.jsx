import { Link } from "react-router-dom";
import { C } from "../lib/theme";

export default function JobCard({ job, linkTo, showSlots = true }) {
  const slotsRemaining = job.slots_needed - job.slots_filled;
  const dateFormatted = new Date(job.date + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <Link to={linkTo} style={{ textDecoration: "none" }}>
      <div
        className="card-hover"
        style={{
          background: job.is_urgent
            ? `linear-gradient(180deg, ${C.red}10, ${C.s2} 60%)`
            : C.s2,
          borderRadius: 14,
          padding: "20px 22px",
          border: "1px solid " + (job.is_urgent ? C.red + "55" : C.b1),
          boxShadow: job.is_urgent ? `0 0 0 1px ${C.red}22` : "none",
          cursor: "pointer",
          position: "relative",
        }}
      >
        {/* Top row: title + rate */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
              {job.is_urgent && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 6,
                    background: "#ef444420",
                    color: C.red,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Urgent
                </span>
              )}
              {job.production_name && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 6,
                    background: C.accent + "15",
                    color: C.accentL,
                  }}
                >
                  {job.production_name}
                </span>
              )}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.t1, letterSpacing: -0.2 }}>{job.title}</div>
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: C.green,
              whiteSpace: "nowrap",
            }}
          >
            &pound;{job.day_rate}
          </div>
        </div>

        {/* Details row */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: C.t3 }}>
          <span>{job.location}</span>
          <span style={{ color: C.b2 }}>{"\u00b7"}</span>
          <span>{dateFormatted}</span>
          <span style={{ color: C.b2 }}>{"\u00b7"}</span>
          <span>{job.start_time} {"\u2013"} {job.end_time}</span>
          {showSlots && (
            <>
              <span style={{ color: C.b2 }}>{"\u00b7"}</span>
              <span style={{ color: slotsRemaining <= 1 ? C.orange : C.t3 }}>
                {slotsRemaining}/{job.slots_needed} slots
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
