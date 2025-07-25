import * as functions from 'firebase-functions';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: functions.config().openai.key });
const MODEL = 'gpt-3.5-turbo';

export async function generateWithOpenAI(prompt: string): Promise<string> {
  try {
    const chat = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
    });
    return chat.choices[0]?.message?.content?.trim() || '';
  } catch (err) {
    console.error('[OpenAI] Generation error:', err);
    return '[Error generating response]';
  }
}

type OpenAIInput = { prompt?: string };

export const generateOpenAI = functions.https.onCall(async (data, _context) => {
  const prompt = (data as OpenAIInput).prompt ?? '';
  const result = await generateWithOpenAI(prompt);
  return { result };
});
