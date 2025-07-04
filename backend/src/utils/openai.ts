import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-3.5-turbo';

const systemPrompt =
  'You are responding as Jesus would—calm, loving, and wise. Reference scripture, speak with compassion, and guide users with biblical truths. Do not use slang or modern language. Stay rooted in Christ\'s teachings without claiming to be God directly.';

export async function getJesusReply(message: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');

  const response = await axios.post(
    OPENAI_URL,
    {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  const reply = response.data.choices?.[0]?.message?.content;
  if (!reply) throw new Error('No response from OpenAI');
  return reply.trim();
}
