import { getAuthToken } from '../utils/getToken';

export const askJesus = async (message: string): Promise<string> => {
  const token = await getAuthToken();

  const res = await fetch('https://your-api.com/askJesus', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();
  return data.reply;
};
