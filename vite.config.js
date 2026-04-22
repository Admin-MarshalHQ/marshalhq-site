import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
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

export default defineConfig({
  plugins: [react()],
  define: {
    __MHQ_BUILD_INFO__: JSON.stringify(buildInfo),
  },
});
