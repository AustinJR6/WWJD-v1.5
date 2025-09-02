import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import fetch from "node-fetch";
import { callVertex, buildVertexUrl } from "./vertex.js";
import { CONFIG } from "./config.js";
import { buildJesusPrompt } from "./prompts/JesusPrompt.js";

// Tiny helper: read runtime service account email from metadata server
async function getServiceAccountEmail(): Promise<string> {
  try {
    const res = await fetch("http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email", {
      headers: { "Metadata-Flavor": "Google" }
    });
    if (!res.ok) return `unknown(${res.status})`;
    return await res.text();
  } catch {
    return "unknown";
  }
}

// Cold-start self test (safe, 1-token-ish)
async function selfTestOnce() {
  if (CONFIG.DISABLE_SELF_TEST) return;
  try {
    const sa = await getServiceAccountEmail();
    logger.info("askJesus self-test starting", {
      project: CONFIG.PROJECT_ID,
      location: CONFIG.VERTEX_LOCATION,
      model: CONFIG.MODEL_ID,
      url: buildVertexUrl(),
      serviceAccount: sa
    });
    // ultra-light probe: do not block request path; just attempt once
    await callVertex("ping");
    logger.info("askJesus self-test ok");
  } catch (e: any) {
    logger.error("askJesus self-test failed", { error: String(e) });
  }
}

let selfTestKicked = false;

// ---- BEGIN robust body normalization ----
function coerceToString(x: unknown): string {
  if (x == null) return "";
  if (typeof x === "string") return x;
  try { return JSON.stringify(x); } catch { return String(x); }
}

function extractPrompt(req: any): string {
  // If body arrived as a raw string but Functions didn't parse it:
  if (typeof req.body === "string") {
    const raw = req.body as string;
    try {
      req.body = JSON.parse(raw);
    } catch {
      // Accept raw payload as the prompt
      return raw.trim();
    }
  }

  // If URL-encoded form was sent:
  if (req.is?.("application/x-www-form-urlencoded") && typeof req.body === "object" && req.body) {
    const b = req.body as Record<string, unknown>;
    const maybe = b.prompt ?? b.text ?? b.message ?? b.content ?? b.q ?? b.query;
    if (maybe) return coerceToString(maybe).trim();
  }

  // JSON or already-parsed body:
  if (req.body && typeof req.body === "object") {
    const b = req.body as Record<string, unknown>;
    const maybe = b.prompt ?? b.text ?? b.message ?? b.content ?? b.q ?? b.query;
    if (maybe) return coerceToString(maybe).trim();
  }

  // As a last resort, allow query parameters (?prompt=...)
  const qp = (req.query?.prompt ?? req.query?.q) as unknown;
  return coerceToString(qp).trim();
}
// ---- END robust body normalization ----

export const askJesus = onRequest(
  { region: "us-central1", cors: true, timeoutSeconds: 60, memory: "256MiB" },
  async (req, res) => {
    if (!selfTestKicked) { selfTestKicked = true; selfTestOnce(); }

    try {
      if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      const contentType = req.get?.("content-type") || "unknown";
      const promptRaw = extractPrompt(req);

      // Diagnostics (no user content):
      logger.info("askJesus request received", {
        contentType,
        hasBody: !!req.body,
        promptLength: promptRaw?.length || 0,
        model: CONFIG.MODEL_ID,
        location: CONFIG.VERTEX_LOCATION,
        vertexUrl: buildVertexUrl(),
      });

      const userInput = (promptRaw || "").trim();
      if (!userInput) {
        res.status(400).json({ error: "Missing prompt" });
        return;
      }

      // Route through JesusPrompt.ts
      const jesusInput = buildJesusPrompt(userInput);

      // Call Vertex
      const out = await callVertex(jesusInput);

      const text =
        out?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("\n")
        ?? out?.output_text
        ?? JSON.stringify(out);

      res.status(200).json({
        ok: true,
        model: CONFIG.MODEL_ID,
        location: CONFIG.VERTEX_LOCATION,
        text
      });
    } catch (err: any) {
      // bubble exact upstream error (e.g., Vertex 403/404) to help debugging
      logger.error("askJesus error", { error: String(err) });
      res.status(502).json({ ok: false, error: String(err) });
    }
  }
);

// Optional debug endpoint that never returns secrets
export const askJesus_info = onRequest({ region: "us-central1", cors: true }, async (_req, res) => {
  const sa = await getServiceAccountEmail();
  res.json({
    project: CONFIG.PROJECT_ID,
    model: CONFIG.MODEL_ID,
    location: CONFIG.VERTEX_LOCATION,
    vertexUrl: buildVertexUrl(),
    serviceAccount: sa,
  });
});
