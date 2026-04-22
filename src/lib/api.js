import { supabase } from "./supabase";

function dedupeIds(values = []) {
  return [...new Set(values.filter(Boolean))];
}

export async function fetchPublicProfiles(ids = []) {
  const uniqueIds = dedupeIds(ids);

  if (uniqueIds.length === 0) {
    return { data: [], error: null };
  }

  return supabase.from("public_profiles").select("*").in("id", uniqueIds);
}

export async function fetchPublicProfile(id) {
  if (!id) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return { data, error };
}

export async function fetchJobManagerContact(jobId) {
  if (!jobId) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase.rpc("get_job_manager_contact", {
    p_job_id: jobId,
  });

  return { data: data?.[0] || null, error };
}

export async function fetchJobApplicantContacts(jobId) {
  if (!jobId) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase.rpc("get_job_applicant_contacts", {
    p_job_id: jobId,
  });

  return { data: data || [], error };
}

export async function acceptApplication(applicationId) {
  return supabase.rpc("accept_application", {
    p_application_id: applicationId,
  });
}

export async function declineApplication(applicationId) {
  return supabase.rpc("decline_application", {
    p_application_id: applicationId,
  });
}

export async function withdrawApplication(jobId) {
  return supabase.rpc("withdraw_application", {
    p_job_id: jobId,
  });
}

export async function cancelJob(jobId) {
  return supabase.rpc("cancel_job", {
    p_job_id: jobId,
  });
}

export async function completeJob(jobId) {
  return supabase.rpc("complete_job", {
    p_job_id: jobId,
  });
}

export function mapRowsById(rows = []) {
  return rows.reduce((acc, row) => {
    acc[row.id] = row;
    return acc;
  }, {});
}
