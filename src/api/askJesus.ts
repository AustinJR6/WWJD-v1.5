import { postJSON } from '../lib/http';

export async function askJesusApi(url: string, userInput: string) {
  if (!userInput) throw new Error('missing userInput');
  return postJSON(url, { message: userInput });
}
