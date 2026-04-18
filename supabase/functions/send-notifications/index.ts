// Supabase Edge Function — send-notifications
//
// Polls the `notifications` table for unsent rows, composes a plain-text email
// per row, sends via Resend, and marks sent_at / error.
//
// Trigger options:
//   1. Supabase scheduled cron — every 1–5 minutes (recommended).
//   2. pg webhook on INSERT to `notifications` — invoke this function directly.
//
// Required env vars (set via `supabase secrets set` or Dashboard):
//   SUPABASE_URL                (auto-populated in Edge Functions)
//   SUPABASE_SERVICE_ROLE_KEY   (auto-populated in Edge Functions)
//   RESEND_API_KEY              (from resend.com)
//   RESEND_FROM_EMAIL           e.g. "MarshalHQ <hello@marshalhq.com>"
//   SITE_URL                    e.g. "https://marshalhq.com"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendKey = Deno.env.get("RESEND_API_KEY")!;
const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "MarshalHQ <hello@marshalhq.com>";
const siteUrl = Deno.env.get("SITE_URL") ?? "https://marshalhq.com";

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type NotificationRow = {
  id: string;
  recipient_id: string;
  type: string;
  job_id: string | null;
  actor_id: string | null;
  payload: Record<string, unknown>;
};

function buildMessage(n: NotificationRow, ctx: {
  recipientName: string;
  actorName: string;
  jobTitle: string;
}): { subject: string; body: string } {
  const link = (path: string) => `${siteUrl}${path}`;
  const hey = `Hi ${ctx.recipientName || "there"},`;

  switch (n.type) {
    case "application_received":
      return {
        subject: `New applicant for ${ctx.jobTitle}`,
        body:
          `${hey}\n\n${ctx.actorName || "A marshal"} has applied for "${ctx.jobTitle}".\n\n` +
          `Review applicants: ${link(`/manager/job/${n.job_id}`)}\n\n— MarshalHQ`,
      };
    case "application_accepted":
      return {
        subject: `You're booked for ${ctx.jobTitle}`,
        body:
          `${hey}\n\nGood news — you've been accepted for "${ctx.jobTitle}".\n\n` +
          `See details and contact info: ${link(`/job/${n.job_id}`)}\n\n— MarshalHQ`,
      };
    case "application_declined":
      return {
        subject: `Update on ${ctx.jobTitle}`,
        body:
          `${hey}\n\nThe manager has chosen other applicants for "${ctx.jobTitle}".\n\n` +
          `Browse more jobs: ${link("/marshal/dashboard")}\n\n— MarshalHQ`,
      };
    case "job_completed":
      return {
        subject: `Leave a review: ${ctx.jobTitle}`,
        body:
          `${hey}\n\n"${ctx.jobTitle}" is complete. Your review helps everyone build trust on MarshalHQ.\n\n` +
          `Leave a review: ${link(`/review/${n.job_id}/${n.actor_id}`)}\n\n— MarshalHQ`,
      };
    case "review_received":
      return {
        subject: `You received a new review`,
        body:
          `${hey}\n\n${ctx.actorName || "Someone"} left you a review${ctx.jobTitle ? ` for "${ctx.jobTitle}"` : ""}.\n\n` +
          `View your profile: ${link(`/marshal/${n.recipient_id}`)}\n\n— MarshalHQ`,
      };
    default:
      return {
        subject: `MarshalHQ update`,
        body: `${hey}\n\nYou have a new update on MarshalHQ.\n\n${link("/")}`,
      };
  }
}

async function sendEmail(to: string, subject: string, body: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: fromEmail, to, subject, text: body }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend ${res.status}: ${text}`);
  }
}

async function processBatch(limit = 50) {
  const { data: rows, error } = await admin
    .from("notifications")
    .select("id, recipient_id, type, job_id, actor_id, payload")
    .is("sent_at", null)
    .is("error", null)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!rows || rows.length === 0) return { processed: 0 };

  let processed = 0;
  for (const n of rows as NotificationRow[]) {
    try {
      const [{ data: recipient }, actorRes, jobRes] = await Promise.all([
        admin.from("profiles").select("email, full_name").eq("id", n.recipient_id).single(),
        n.actor_id
          ? admin.from("profiles").select("full_name").eq("id", n.actor_id).single()
          : Promise.resolve({ data: null }),
        n.job_id
          ? admin.from("jobs").select("title").eq("id", n.job_id).single()
          : Promise.resolve({ data: null }),
      ]);

      if (!recipient?.email) {
        await admin.from("notifications").update({ error: "no recipient email" }).eq("id", n.id);
        continue;
      }

      const { subject, body } = buildMessage(n, {
        recipientName: recipient.full_name ?? "",
        actorName: (actorRes as { data: { full_name?: string } | null }).data?.full_name ?? "",
        jobTitle: (jobRes as { data: { title?: string } | null }).data?.title ?? "your job",
      });

      await sendEmail(recipient.email, subject, body);
      await admin.from("notifications").update({ sent_at: new Date().toISOString() }).eq("id", n.id);
      processed++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await admin.from("notifications").update({ error: message.slice(0, 500) }).eq("id", n.id);
    }
  }
  return { processed };
}

Deno.serve(async () => {
  try {
    const result = await processBatch();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
