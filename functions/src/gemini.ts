import { VertexAI } from '@google-cloud/vertexai';

const PROJECT_ID =
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.PROJECT_ID;
const LOCATION = process.env.REGION || 'us-central1';

function resolveModel(input?: string): string {
  const raw = (input || process.env.MODEL || '').trim();
  if (!raw) return 'gemini-2.5-flash';

  const v = raw.toLowerCase();
  // Map deprecated/preview aliases to stable models
  if (
    v.includes('preview') ||
    v.includes('0409') ||
    v === 'gemini-pro' ||
    v === 'gemini-1.0-pro' ||
    v === 'gemini-1.5-pro-preview' ||
    v === 'gemini-1.5-pro-preview-0409'
  ) {
    return 'gemini-1.5-pro';
  }
  if (v === 'gemini-flash' || v === 'gemini-1.0-flash') return 'gemini-1.5-flash';
  if (v === 'gemini-2.0-flash') return 'gemini-2.0-flash-001';
  if (v === 'gemini-2.0-flash-lite') return 'gemini-2.0-flash-lite-001';
  if (v === 'gemini-2.5' || v === 'gemini-2.5-pro') return 'gemini-2.5-pro';
  if (v === 'gemini-2.5-flash-lite') return 'gemini-2.5-flash-lite';
  // Normalize some common typos
  if (v === 'gemini1-5-pro') return 'gemini-1.5-pro';
  if (v === 'gemini1-5-flash') return 'gemini-1.5-flash';
  if (v === 'gemini2-5-flash') return 'gemini-2.5-flash';
  // Otherwise assume caller provided a valid current model id
  return raw;
}

const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });

function getModel(modelOverride?: string) {
  const model = resolveModel(modelOverride);
  return vertexAI.getGenerativeModel({
    model,
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });
}

export async function generateWithGemini(prompt: string, modelOverride?: string): Promise<string> {
  const primary = resolveModel(modelOverride);
  const fallbacks = [
    primary,
    // Pragmatic fallbacks in case a project lacks access
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite-001',
    'gemini-1.5-flash',
  ].map(resolveModel).filter((m, i, arr) => arr.indexOf(m) === i); // normalize + de-dup

  let lastErr: any;
  for (const model of fallbacks) {
    try {
      const generativeModel = getModel(model);
      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      if (text) return text;
      // If empty, treat as failure and try next
      lastErr = new Error('Empty response');
    } catch (err: any) {
      const msg = String(err?.message || err);
      const isNotFound = /not\s*found|404|model/i.test(msg);
      if (!isNotFound) throw err; // other errors should bubble
      lastErr = err; // try next fallback
    }
  }
  // eslint-disable-next-line no-console
  console.error('[gemini] All model attempts failed:', fallbacks, lastErr?.message || lastErr);
  throw lastErr || new Error('Model generation failed');
}

// Export resolver for logging/diagnostics if needed elsewhere
export { resolveModel };
