import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function ManagerProfile() {
  const { user, profile, fetchProfile } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profile) return;

    setForm({
      full_name: profile.full_name || "",
      email: profile.email || user?.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      bio: profile.bio || "",
    });
  }, [profile, user]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!user || !form) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    if (!form.full_name.trim()) {
      setError("Please add your full name.");
      setSaving(false);
      return;
    }

    if (!form.email.trim()) {
      setError("Please add the email marshals should use to reach you.");
      setSaving(false);
      return;
    }

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      bio: form.bio.trim(),
    };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      await fetchProfile(user);
    }

    setSaving(false);
  };

  if (!form) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
        <Navbar />
        <Section style={{ paddingTop: 100, textAlign: "center" }}>
          <p style={{ color: C.t3 }}>Loading settings...</p>
        </Section>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
      <Navbar />
      <Section style={{ paddingTop: 100, maxWidth: 640 }}>
        <Link
          to="/manager/dashboard"
          style={{
            fontSize: 13,
            color: C.t4,
            textDecoration: "none",
            marginBottom: 16,
            display: "inline-block",
          }}
        >
          &larr; Back to Dashboard
        </Link>
        <SectionLabel>Manager Settings</SectionLabel>
        <SectionTitle>Manage your booking details</SectionTitle>
        <p style={{ fontSize: 15, color: C.t3, marginBottom: 32 }}>
          Accepted marshals only see these contact details after you confirm them for a job.
        </p>

        <div
          style={{
            background: C.s2,
            borderRadius: 24,
            padding: 32,
            border: "1px solid " + C.b1,
            marginBottom: 28,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full Name</label>
            <input
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              placeholder="Your name"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Contact Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="name@production.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="e.g. 07700 900000"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Location</label>
            <input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. Greater London"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>About You</label>
            <textarea
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Add a short note about your productions, team, or preferred working style."
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </div>

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
          onClick={handleSave}
          disabled={saving}
          className="cta-btn"
          style={{
            width: "100%",
            padding: "18px",
            background: saved ? C.green : C.accent,
            color: saved ? "#fff" : C.bg,
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            fontFamily: "inherit",
            letterSpacing: 0.5,
            marginBottom: 60,
          }}
        >
          {saving ? "Saving..." : saved ? "Details Saved" : "Save Settings"}
        </button>
      </Section>
    </div>
  );
}
