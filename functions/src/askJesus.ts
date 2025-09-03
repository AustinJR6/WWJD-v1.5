import { onRequest } from "firebase-functions/v2/https";
import { VertexAI } from "@google-cloud/vertexai";
import { JESUS_SYSTEM_TEXT } from "./jesusPrompt.js";

const PROJECT_ID = process.env.GCLOUD_PROJECT!;
const LOCATION = process.env.VERTEX_LOCATION || "us-central1";
const MODEL = process.env.VERTEX_MODEL || "gemini-2.0-flash";
const DEBUG = process.env.DEBUG_ASKJESUS === "1";

const vertex = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const model = vertex.getGenerativeModel({ model: MODEL });

function sendCors(res: any) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type,X-Debug");
}

export const askJesus = onRequest({ cors: true }, async (req, res) => {
  sendCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    // Robust body parsing: JSON, raw text, form, or query.
    let body: any = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch { /* keep string */ }
    }
    const fromJson = typeof body === "object" && body ? body.message : undefined;
    const fromRaw = typeof body === "string" ? body : undefined;
    const fromQuery = (req.query?.message as string) || undefined;
    const fromForm = (req as any).files ? undefined : (req as any).body?.message; // best-effort

    const message: string | undefined =
      fromJson || fromQuery || fromForm || (fromRaw && fromRaw.trim() ? fromRaw : undefined);

    if (DEBUG) {
      console.log("askJesus DEBUG incoming:", {
        method: req.method,
        contentType: req.get("content-type"),
        hasBody: !!req.body,
        bodyType: typeof req.body,
        query: req.query,
        inferredMessageLen: message?.length ?? 0,
      });
    }

    if (!message) {
      res.status(400).json({
        error: "Missing 'message'. Send JSON { message: string } or ?message=...",
        hint: {
          expected: { message: "Hello there" },
          receivedContentType: req.get("content-type") || null,
          receivedType: typeof req.body,
        },
      });
      return;
    }

    const systemInstruction = { parts: [{ text: JESUS_SYSTEM_TEXT }] } as any;

    const result = await model.generateContent({
      systemInstruction,
      contents: [{ role: "user", parts: [{ text: message }]}],
      generationConfig: { maxOutputTokens: 768, temperature: 0.7 },
    });

    const r = result.response;
    const cand = r?.candidates?.[0];
    const text =
      cand?.content?.parts?.map((p: any) => p?.text ?? "").join("")?.trim() ?? "";

    if (DEBUG) {
      console.log("askJesus DEBUG out:", {
        finishReason: cand?.finishReason,
        model: (r as any)?.modelVersion,
        usage: r?.usageMetadata,
        textPreview: text.slice(0, 120),
      });
    }

    res.status(200).json({
      text,
      finishReason: cand?.finishReason ?? null,
      usage: r?.usageMetadata ?? null,
      model: (r as any)?.modelVersion ?? MODEL,
    });
    return;
  } catch (e: any) {
    console.error("askJesus error:", e);
    res.status(500).json({ error: e?.message || "Server error" });
    return;
  }
});
