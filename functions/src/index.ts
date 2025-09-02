import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler"; // if needed later
import { callVertex, buildVertexUrl } from "./vertex";
import { CONFIG } from "./config";
import * as logger from "firebase-functions/logger";
import fetch from "node-fetch";

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

export const askJesus = onRequest(
  { region: "us-central1", cors: true, timeoutSeconds: 60, memory: "256MiB" },
  async (req, res) => {
    if (!selfTestKicked) { selfTestKicked = true; selfTestOnce(); }

    try {
      if (req.method !== "POST") { res.status(405).send("Method Not Allowed"); return; }
      const prompt = (req.body?.prompt ?? req.body?.text ?? "").toString().trim();
      if (!prompt) { res.status(400).json({ error: "Missing prompt" }); return; }

      // assert model + location are what we expect
      if (!/^gemini-(2(\.5)?)-(flash|flash-lite)/.test(CONFIG.MODEL_ID)) {
        logger.warn("Unexpected MODEL_ID; overriding to gemini-2.5-flash", { current: CONFIG.MODEL_ID });
      }

      const out = await callVertex(prompt);

      // normalize response shape
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
      // Return exact upstream error to help debugging
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
