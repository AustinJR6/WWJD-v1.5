import { JESUS_PROMPT } from '../prompts/JesusPrompt';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

export async function askJesus(message: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: JESUS_PROMPT },
        { role: 'user', content: message },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI request failed');
  }

  const json = await response.json();
  return json.choices[0].message.content.trim();
}
