import { supabase } from "./supabase";

// Enqueue a notification for an Edge Function / cron worker to deliver.
// Failures are logged but never thrown — notifications are best-effort.
export async function enqueueNotification({
  recipientId,
  type,
  jobId = null,
  actorId = null,
  payload = {},
}) {
  if (!recipientId || !type) return;
  try {
    const { error } = await supabase.from("notifications").insert({
      recipient_id: recipientId,
      type,
      job_id: jobId,
      actor_id: actorId,
      payload,
    });
    if (error) console.warn("Notification enqueue failed:", error.message);
  } catch (err) {
    console.warn("Notification enqueue threw:", err);
  }
}
