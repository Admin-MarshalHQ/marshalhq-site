import { useState, useEffect } from "react";
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

const DAYS = [
  { key: "availability_mon", label: "Mon" },
  { key: "availability_tue", label: "Tue" },
  { key: "availability_wed", label: "Wed" },
  { key: "availability_thu", label: "Thu" },
  { key: "availability_fri", label: "Fri" },
  { key: "availability_sat", label: "Sat" },
  { key: "availability_sun", label: "Sun" },
];

const CERTS = [
  { key: "has_sia", label: "SIA Badge", icon: "\ud83d\udee1\ufe0f" },
  { key: "has_cscs", label: "CSCS Card", icon: "\ud83c\udfd7\ufe0f" },
  { key: "has_first_aid", label: "First Aid", icon: "\u2695\ufe0f" },
  { key: "has_own_transport", label: "Own Transport", icon: "\ud83d\ude97" },
];

export default function MarshalProfile() {
  const { user, profile, fetchProfile } = useAuth();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        day_rate_min: profile.day_rate_min || 140,
        day_rate_max: profile.day_rate_max || 200,
        travel_radius_miles: profile.travel_radius_miles || 30,
        has_sia: profile.has_sia || false,
        has_cscs: profile.has_cscs || false,
        has_first_aid: profile.has_first_aid || false,
        has_own_transport: profile.has_own_transport || false,
        availability_mon: profile.availability_mon ?? true,
        availability_tue: profile.availability_tue ?? true,
        availability_wed: profile.availability_wed ?? true,
        availability_thu: profile.availability_thu ?? true,
        availability_fri: profile.availability_fri ?? true,
        availability_sat: profile.availability_sat ?? false,
        availability_sun: profile.availability_sun ?? false,
      });
    }
  }, [profile]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase
      .from("profiles")
      .update(form)
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
          <p style={{ color: C.t3 }}>Loading profile...</p>
        </Section>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
      <Navbar />
      <Section style={{ paddingTop: 100, maxWidth: 640 }}>
        <Link
          to="/marshal/dashboard"
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
        <SectionLabel>My Profile</SectionLabel>
        <SectionTitle>Edit your profile</SectionTitle>
        <p style={{ fontSize: 15, color: C.t3, marginBottom: 32 }}>
          Managers see this when reviewing your applications. A complete profile gets more bookings.
        </p>

        {/* Basic info */}
        <div
          style={{
            background: C.s2,
            borderRadius: 24,
            padding: 32,
            border: "1px solid " + C.b1,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.t1,
              marginBottom: 20,
            }}
          >
            Basic Info
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full Name</label>
            <input
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              placeholder="Your full name"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="e.g. 07700 900000"
              type="tel"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Location</label>
            <input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g. East London"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              placeholder="Tell managers a bit about yourself — experience, what you're good at, why you're reliable"
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </div>

        {/* Rates & travel */}
        <div
          style={{
            background: C.s2,
            borderRadius: 24,
            padding: 32,
            border: "1px solid " + C.b1,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.t1,
              marginBottom: 20,
            }}
          >
            Rates & Travel
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <label style={labelStyle}>Min Day Rate (&pound;)</label>
              <input
                type="number"
                value={form.day_rate_min}
                onChange={(e) => update("day_rate_min", parseInt(e.target.value) || 0)}
                min="0"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Max Day Rate (&pound;)</label>
              <input
                type="number"
                value={form.day_rate_max}
                onChange={(e) => update("day_rate_max", parseInt(e.target.value) || 0)}
                min="0"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Travel Radius (mi)</label>
              <input
                type="number"
                value={form.travel_radius_miles}
                onChange={(e) =>
                  update("travel_radius_miles", parseInt(e.target.value) || 0)
                }
                min="0"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div
          style={{
            background: C.s2,
            borderRadius: 24,
            padding: 32,
            border: "1px solid " + C.b1,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.t1,
              marginBottom: 20,
            }}
          >
            Certifications
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {CERTS.map((cert) => (
              <button
                key={cert.key}
                type="button"
                onClick={() => update(cert.key, !form[cert.key])}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 16px",
                  background: form[cert.key] ? "#10b98115" : C.s3,
                  border: "2px solid " + (form[cert.key] ? C.green : C.b1),
                  borderRadius: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: "2px solid " + (form[cert.key] ? C.green : C.b1),
                    background: form[cert.key] ? C.green : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {form[cert.key] && "\u2713"}
                </div>
                <div style={{ textAlign: "left" }}>
                  <span style={{ fontSize: 16, marginRight: 6 }}>{cert.icon}</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: form[cert.key] ? C.green : C.t2,
                    }}
                  >
                    {cert.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div
          style={{
            background: C.s2,
            borderRadius: 24,
            padding: 32,
            border: "1px solid " + C.b1,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.t1,
              marginBottom: 6,
            }}
          >
            Availability
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.t4,
              marginBottom: 20,
            }}
          >
            Select the days you're generally available for work
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DAYS.map((day) => (
              <button
                key={day.key}
                type="button"
                onClick={() => update(day.key, !form[day.key])}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  border: "2px solid " + (form[day.key] ? C.accent : C.b1),
                  background: form[day.key] ? "#6366f118" : C.s3,
                  color: form[day.key] ? C.accent : C.t4,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {day.label}
              </button>
            ))}
          </div>
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

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="cta-btn"
          style={{
            width: "100%",
            padding: "18px",
            background: saved
              ? C.green
              : "linear-gradient(135deg,#6366f1,#4f46e5)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 800,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            fontFamily: "inherit",
            boxShadow: saved ? "none" : "0 4px 20px #6366f144",
            marginBottom: 60,
          }}
        >
          {saving ? "Saving..." : saved ? "\u2713 Profile Saved" : "Save Profile"}
        </button>
      </Section>
    </div>
  );
}
