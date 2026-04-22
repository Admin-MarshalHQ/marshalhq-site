const FALLBACK_BUILD_INFO = {
  version: "dev",
  commitSha: "local",
  shortSha: "local",
  branch: "local",
  deploymentId: null,
  builtAt: null,
  runtime: "local",
};

export const BUILD_INFO =
  typeof __MHQ_BUILD_INFO__ !== "undefined"
    ? __MHQ_BUILD_INFO__
    : FALLBACK_BUILD_INFO;

export function formatBuildTime(value) {
  if (!value) return "Unknown";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
