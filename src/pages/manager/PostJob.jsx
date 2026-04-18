import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { C } from "../../lib/theme";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import Navbar from "../../components/Navbar";
import { Section, SectionLabel, SectionTitle } from "../../components/ui/Section";

const inputStyle = {
  width: "100%",
  padding: "13px 16px",
  background: C.s3,
  border: "1px solid " + C.b1,
  borderRadius: 12,
  color: C.t1,
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
  outline: "none",
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: C.t3,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 6,
  display: "block",
};

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEdit = Boolean(editId);

  const [form, setForm] = useState({
    title: "",
    production_name: "",
    location: "",
    date: "",
    start_time: "07:00",
    end_time: "19:00",
    day_rate: "",
    slots_needed: "1",
    description: "",
    requirements: "",
    is_urgent: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!editId || !user) return;
    (async () => {
      const { data, error: fetchErr } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", editId)
        .eq("posted_by", user.id)
        .single();
      if (fetchErr || !data) {
        setError("Job not found or you don't have access.");
      } else {
        setForm({
          title: data.title || "",
          production_name: data.production_name || "",
          location: data.location || "",
          date: data.date || "",
          start_time: data.start_time || "07:00",
          end_time: data.end_time || "19:00",
          day_rate: data.day_rate?.toString() || "",
          slots_needed: data.slots_needed?.toString() || "1",
          description: data.description || "",
          requirements: data.requirements || "",
          is_urgent: data.is_urgent || false,
        });
      }
      setFetching(false);
    })();
  }, [editId, user]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.location || !form.date || !form.day_rate) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.start_time && form.end_time && form.end_time <= form.start_time) {
      setError("End time must be after start time.");
      return;
    }

    setLoading(true);

    const payload = {
      title: form.title.trim(),
      production_name: form.production_name.trim(),
      location: form.location.trim(),
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      day_rate: parseInt(form.day_rate),
      slots_needed: parseInt(form.slots_needed) || 1,
      description: form.description.trim(),
      requirements: form.requirements.trim(),
      is_urgent: form.is_urgent,
    };

    let submitError;
    if (isEdit) {
      const { error: e } = await supabase
        .from("jobs")
        .update(payload)
        .eq("id", editId)
        .eq("posted_by", user.id);
      submitError = e;
    } else {
      const { error: e } = await supabase
        .from("jobs")
        .insert({ ...payload, posted_by: user.id });
      submitError = e;
    }

    setLoading(false);

    if (submitError) {
      setError(submitError.message);
    } else {
      navigate(isEdit ? `/manager/job/${editId}` : "/manager/dashboard");
    }
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
      <Navbar />
      <Section style={{ paddingTop: 100, maxWidth: 640 }}>
        <Link
          to="/manager/dashboard"
          style={{ fontSize: 13, color: C.t4, textDecoration: "none", marginBottom: 16, display: "inline-block" }}
        >
          &larr; Back to Dashboard
        </Link>
        <SectionLabel>{isEdit ? "Edit Job" : "New Job"}</SectionLabel>
        <SectionTitle>{isEdit ? "Edit job details" : "Post a job"}</SectionTitle>
        <p style={{ fontSize: 15, color: C.t3, marginBottom: 32 }}>
          {isEdit
            ? "Update the job details below. Changes are saved immediately."
            : "Fill in the details below. Your job will be visible to all marshals immediately."}
        </p>

        {fetching ? (
          <div style={{ textAlign: "center", padding: 40, color: C.t3 }}>Loading job...</div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ background: C.s2, borderRadius: 24, padding: 32, border: "1px solid " + C.b1 }}>
            {/* Title */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Job Title *</label>
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. Road Closure Marshal — Night Shoot"
                style={inputStyle}
              />
            </div>

            {/* Production Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Production Name</label>
              <input
                value={form.production_name}
                onChange={(e) => update("production_name", e.target.value)}
                placeholder="e.g. Untitled BBC Drama"
                style={inputStyle}
              />
            </div>

            {/* Location */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Location *</label>
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. Shoreditch, East London"
                style={inputStyle}
              />
            </div>

            {/* Date + Times row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 18 }}>
              <div>
                <label style={labelStyle}>Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Start Time</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => update("start_time", e.target.value)}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </div>
              <div>
                <label style={labelStyle}>End Time</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => update("end_time", e.target.value)}
                  style={{ ...inputStyle, colorScheme: "dark" }}
                />
              </div>
            </div>

            {/* Rate + Slots row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div>
                <label style={labelStyle}>Day Rate (&pound;) *</label>
                <input
                  type="number"
                  value={form.day_rate}
                  onChange={(e) => update("day_rate", e.target.value)}
                  placeholder="e.g. 160"
                  min="0"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Marshals Needed</label>
                <input
                  type="number"
                  value={form.slots_needed}
                  onChange={(e) => update("slots_needed", e.target.value)}
                  min="1"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What does the job involve? Any specifics marshals should know?"
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Requirements */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Requirements</label>
              <textarea
                value={form.requirements}
                onChange={(e) => update("requirements", e.target.value)}
                placeholder="e.g. SIA badge required, own transport preferred"
                rows={2}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Urgent toggle */}
            <div style={{ marginBottom: 24 }}>
              <button
                type="button"
                onClick={() => update("is_urgent", !form.is_urgent)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  background: form.is_urgent ? "#ef444418" : C.s3,
                  border: "1px solid " + (form.is_urgent ? "#ef444444" : C.b1),
                  borderRadius: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: "2px solid " + (form.is_urgent ? C.red : C.b1),
                    background: form.is_urgent ? C.red : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {form.is_urgent && "\u2713"}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: form.is_urgent ? C.red : C.t2 }}>
                    Mark as Urgent
                  </div>
                  <div style={{ fontSize: 12, color: C.t4 }}>
                    Urgent jobs are highlighted in the feed
                  </div>
                </div>
              </button>
            </div>

            {/* Error */}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="cta-btn"
              style={{
                width: "100%",
                padding: "16px",
                background: C.accent,
                color: C.bg,
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                fontFamily: "inherit",
                letterSpacing: 0.5,
              }}
            >
              {loading ? (isEdit ? "Saving..." : "Posting...") : (isEdit ? "Save Changes" : "Post Job")}
            </button>
          </div>
        </form>
        )}
      </Section>
    </div>
  );
}
