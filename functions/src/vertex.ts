import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";
import { CONFIG } from "./config";

const SCOPE = "https://www.googleapis.com/auth/cloud-platform";

export function buildVertexUrl(model = CONFIG.MODEL_ID, location = CONFIG.VERTEX_LOCATION) {
  if (!CONFIG.PROJECT_ID) throw new Error("PROJECT_ID missing");
  return `https://aiplatform.googleapis.com/v1/projects/${CONFIG.PROJECT_ID}/locations/${location}/publishers/google/models/${model}:generateContent`;
}

export async function callVertex(prompt: string) {
  const auth = new GoogleAuth({ scopes: [SCOPE] });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken() as { token: string };

  const url = buildVertexUrl();

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }]}],
    generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    // keep Vertex sane; Cloud Run/Functions has its own timeout
    // @ts-ignore
    timeout: 30000
  });

  const text = await res.text();
  if (!res.ok) {
    // Surface the true Vertex status + payload
    throw new Error(`Vertex ${res.status} ${res.statusText} :: ${text}`);
  }
  try { return JSON.parse(text); } catch {
    return text as any;
  }
}
