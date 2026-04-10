import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { C } from "../lib/theme";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { Section, SectionLabel, SectionTitle } from "../components/ui/Section";

const QUICK_TAGS = ["Punctual", "Professional", "Great with public", "Hard worker", "Would rebook"];

export default function ReviewPage() {
  const { jobId, userId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [targetName, setTargetName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    (async () => {
      // Fetch target user name
      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();
      setTargetName(targetProfile?.full_name || "Unknown");

      // Fetch job title
      const { data: job } = await supabase
        .from("jobs")
        .select("title")
        .eq("id", jobId)
        .single();
      setJobTitle(job?.title || "Unknown Job");

      // Check if already reviewed
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("reviewer_id", user.id)
        .eq("reviewed_user_id", userId)
        .eq("job_id", jobId)
        .single();

      if (existing) setAlreadyReviewed(true);
      setLoading(false);
    })();
  }, [jobId, userId, user]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const tagPrefix = selectedTags.length > 0 ? selectedTags.map((t) => `[${t}]`).join(" ") + " " : "";
    const fullComment = tagPrefix + comment.trim();

    const { error: insertErr } = await supabase.from("reviews").insert({
      reviewer_id: user.id,
      reviewed_user_id: userId,
      job_id: jobId,
      rating,
      comment: fullComment,
    });

    if (insertErr) {
      setError(insertErr.message);
      setSubmitting(false);
      return;
    }

    // Update the reviewed user's avg_rating and total_jobs
    const { data: allReviews } = await supabase
      .from("reviews")
      .select("rating")
      .eq("reviewed_user_id", userId);

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await supabase
        .from("profiles")
        .update({
          avg_rating: Math.round(avg * 100) / 100,
          total_jobs: allReviews.length,
        })
        .eq("id", userId);
    }

    setSubmitting(false);
    navigate(profile?.role === "manager" ? `/manager/job/${jobId}` : "/marshal/dashboard");
  };

  const backPath = profile?.role === "manager" ? `/manager/job/${jobId}` : "/marshal/dashboard";

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

  if (alreadyReviewed) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
        <Navbar />
        <Section style={{ paddingTop: 100, textAlign: "center", maxWidth: 500 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.t1, marginBottom: 8 }}>Already reviewed</div>
          <p style={{ fontSize: 14, color: C.t3, marginBottom: 20 }}>
            You have already left a review for {targetName} on this job.
          </p>
          <Link to={backPath} style={{ color: C.accent, fontSize: 14 }}>
            Go back
          </Link>
        </Section>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.t1 }}>
      <Navbar />
      <Section style={{ paddingTop: 100, maxWidth: 560 }}>
        <Link
          to={backPath}
          style={{ fontSize: 13, color: C.t4, textDecoration: "none", marginBottom: 16, display: "inline-block" }}
        >
          &larr; Back
        </Link>

        <SectionLabel>Leave a Review</SectionLabel>
        <SectionTitle>Review {targetName}</SectionTitle>
        <p style={{ fontSize: 14, color: C.t3, marginBottom: 28 }}>
          For: {jobTitle}
        </p>

        <div
          style={{
            background: C.s2,
            borderRadius: 24,
            padding: 32,
            border: "1px solid " + C.b1,
          }}
        >
          {/* Star rating */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Rating
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 32,
                    cursor: "pointer",
                    padding: 0,
                    filter: star <= rating ? "none" : "grayscale(1) opacity(0.3)",
                    transition: "all 0.15s",
                  }}
                >
                  &#11088;
                </button>
              ))}
            </div>
          </div>

          {/* Quick tags */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Quick tags (optional)
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {QUICK_TAGS.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTags((prev) =>
                        selected ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )
                    }
                    style={{
                      padding: "8px 14px",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      border: "1px solid " + (selected ? C.accent + "66" : C.b1),
                      background: selected ? C.accent + "18" : C.s3,
                      color: selected ? C.accent : C.t3,
                      transition: "all 0.15s",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Comment (optional)
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was working with this person?"
              maxLength={500}
              rows={3}
              style={{
                width: "100%",
                padding: 14,
                background: C.s3,
                color: C.t1,
                border: "1px solid " + C.b1,
                borderRadius: 12,
                fontSize: 14,
                fontFamily: "inherit",
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
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
            onClick={handleSubmit}
            disabled={submitting}
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
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              fontFamily: "inherit",
              letterSpacing: 0.5,
            }}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </Section>
    </div>
  );
}
