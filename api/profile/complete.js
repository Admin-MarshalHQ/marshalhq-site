const { createClient } = require("@supabase/supabase-js");

function isCompleteProfile(profile) {
  return Boolean(
    profile &&
    (profile.role === "marshal" || profile.role === "manager") &&
    profile.full_name?.trim() &&
    profile.email?.trim()
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const { role, fullName } = req.body || {};
  const trimmedName = fullName?.trim() || "";

  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ error: "Server profile completion is not configured." });
    return;
  }

  if (!accessToken) {
    res.status(401).json({ error: "Missing authorization token." });
    return;
  }

  if (!role || !["marshal", "manager"].includes(role)) {
    res.status(400).json({ error: "Please select a valid role." });
    return;
  }

  if (!trimmedName) {
    res.status(400).json({ error: "Please enter your full name." });
    return;
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(accessToken);

  if (userError || !user) {
    res.status(401).json({ error: "Your session has expired. Please sign in again." });
    return;
  }

  const { data: existingProfile, error: existingProfileError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    res.status(400).json({ error: existingProfileError.message });
    return;
  }

  if (existingProfile && !isCompleteProfile(existingProfile)) {
    const { error: deleteError } = await admin.from("profiles").delete().eq("id", user.id);
    if (deleteError) {
      res.status(400).json({ error: deleteError.message });
      return;
    }
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .upsert(
      {
        id: user.id,
        role,
        full_name: trimmedName,
        email: user.email || user.user_metadata?.email || "",
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (profileError) {
    res.status(400).json({ error: profileError.message });
    return;
  }

  res.status(200).json({ profile });
};
