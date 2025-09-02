export const CONFIG = {
  MODEL_ID: process.env.MODEL_ID?.trim() || "gemini-2.5-flash",
  VERTEX_LOCATION: (process.env.VERTEX_LOCATION?.trim() || "global"),
  PROJECT_ID: (process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || "").trim(),
  DISABLE_SELF_TEST: (process.env.DISABLE_SELF_TEST || "").toLowerCase() === "true",
};
