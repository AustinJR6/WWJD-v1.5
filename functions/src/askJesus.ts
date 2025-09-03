import { onRequest } from "firebase-functions/v2/https";
import { VertexAI } from "@google-cloud/vertexai";
import { JESUS_SYSTEM_TEXT } from "./jesusPrompt";

const PROJECT_ID = process.env.GCLOUD_PROJECT!;
const LOCATION = process.env.VERTEX_LOCATION || "us-central1";
const MODEL = process.env.VERTEX_MODEL || "gemini-2.5-flash";

// Single Vertex client/model, reused across requests.
const vertex = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const model = vertex.getGenerativeModel({ model: MODEL });

export const askJesus = onRequest({ cors: true }, async (req, res) => {
  try {
    // Handle string or JSON body
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const message: string | undefined = body?.message;
    if (!message) {
      res.status(400).json({ error: "Missing 'message'." });
      return;
    }

    // System instruction is injected from jesusPrompt.ts to ensure the voice
    const systemInstruction = { role: "system", parts: [{ text: JESUS_SYSTEM_TEXT }] };

    const result = await model.generateContent({
      systemInstruction,
      contents: [{ role: "user", parts: [{ text: message }]}],
      generationConfig: {
        maxOutputTokens: 768,     // prevent early truncation
        temperature: 0.7,
      },
    });

    const r = result.response;
    const cand = r?.candidates?.[0];

    // Extract plain text from parts
    const text =
      cand?.content?.parts?.map((p: any) => p?.text ?? "").join("")?.trim() ?? "";

    // Normalize response so the client never deals with raw Vertex JSON
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
  }
});
