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
          background: C.s2,
          borderRadius: 16,
          padding: 22,
          border: "1px solid " + (job.is_urgent ? "#ef444433" : C.b1),
          cursor: "pointer",
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
                    background: "#6366f118",
                    color: C.accentL,
                  }}
                >
                  {job.production_name}
                </span>
              )}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.t1 }}>{job.title}</div>
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: C.green,
              whiteSpace: "nowrap",
            }}
          >
            &pound;{job.day_rate}
          </div>
        </div>

        {/* Details row */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: C.t3 }}>
          <span>{"\ud83d\udccd"} {job.location}</span>
          <span>{"\ud83d\udcc5"} {dateFormatted}</span>
          <span>{"\u23f0"} {job.start_time} \u2013 {job.end_time}</span>
          {showSlots && (
            <span style={{ color: slotsRemaining <= 1 ? C.orange : C.t3 }}>
              {"\ud83d\udc65"} {slotsRemaining}/{job.slots_needed} slots
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
