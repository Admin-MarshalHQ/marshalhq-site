import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

function readGit(command, fallback) {
  try {
    return execSync(command, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim() || fallback;
  } catch {
    return fallback;
  }
}

function isCompleteProfile(profile) {
  return Boolean(
    profile &&
    (profile.role === "marshal" || profile.role === "manager") &&
    profile.full_name?.trim() &&
    profile.email?.trim()
  );
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function writeJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function completeProfileWithServiceRole({
  supabaseUrl,
  serviceRoleKey,
  accessToken,
  role,
  fullName,
}) {
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const trimmedName = fullName?.trim() || "";

  if (!role || !["marshal", "manager"].includes(role)) {
    throw new Error("Please select a valid role.");
  }

  if (!trimmedName) {
    throw new Error("Please enter your full name.");
  }

  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(accessToken);

  if (userError || !user) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const { data: existingProfile, error: existingProfileError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    throw new Error(existingProfileError.message);
  }

  if (existingProfile && !isCompleteProfile(existingProfile)) {
    const { error: deleteError } = await admin.from("profiles").delete().eq("id", user.id);
    if (deleteError) {
      throw new Error(deleteError.message);
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
    throw new Error(profileError.message);
  }

  return profile;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const commitSha =
    process.env.VERCEL_GIT_COMMIT_SHA || readGit("git rev-parse HEAD", "local");

  const buildInfo = {
    version: packageJson.version,
    commitSha,
    shortSha: commitSha === "local" ? "local" : commitSha.slice(0, 7),
    branch:
      process.env.VERCEL_GIT_COMMIT_REF ||
      readGit("git branch --show-current", "local"),
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || null,
    builtAt: new Date().toISOString(),
    runtime:
      process.env.VERCEL === "1" ? "vercel" : "local",
  };

  return {
    plugins: [
      react(),
      {
        name: "mhq-dev-profile-api",
        configureServer(server) {
          server.middlewares.use("/api/profile/complete", async (req, res, next) => {
            if (req.method !== "POST") {
              next();
              return;
            }

            try {
              const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, "");
              if (!accessToken) {
                writeJson(res, 401, { error: "Missing authorization token." });
                return;
              }

              if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
                writeJson(res, 500, { error: "Server profile completion is not configured." });
                return;
              }

              const body = await readJsonBody(req);
              const profile = await completeProfileWithServiceRole({
                supabaseUrl: env.VITE_SUPABASE_URL,
                serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
                accessToken,
                role: body.role,
                fullName: body.fullName,
              });

              writeJson(res, 200, { profile });
            } catch (error) {
              writeJson(res, 400, { error: error.message || "Unable to complete profile." });
            }
          });
        },
      },
    ],
    define: {
      __MHQ_BUILD_INFO__: JSON.stringify(buildInfo),
    },
  };
});
