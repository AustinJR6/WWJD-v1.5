import { getAuthToken } from '../utils/getToken';

export const askJesus = async (message: string): Promise<string> => {
  try {
    const token = await getAuthToken();

    console.log('Sending message to API:', message);

    const res = await fetch('https://your-api.com/askJesus', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Server error:', res.status, errorText);
      return 'Something went wrong on the server. Please try again later.';
    }

    const data = await res.json();
    console.log('AI reply received:', data.reply);
    return data.reply;
  } catch (err) {
    console.error('Fetch failed:', err);
    return "I'm having trouble connecting. Please check your connection or try again soon.";
  }
};
