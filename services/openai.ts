import { getAuthToken } from '../utils/getToken';

export const askJesus = async (message: string): Promise<string> => {
  try {
    const token = await getAuthToken();

    console.log('Sending message to API:', message);

    const res = await fetch('https://askjesus-54eeuzmaqe-uc.a.run.app', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    console.log('Status:', res.status);

    const text = await res.text();

    if (!res.ok) {
      console.error('Server error:', res.status, text);
      return 'Something went wrong on the server. Please try again later.';
    }

    try {
      const data = JSON.parse(text);
      console.log('Full response:', data);
      console.log('AI reply received:', data.reply);
      return data.reply;
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      return 'Received malformed response from server.';
    }
  } catch (err) {
    console.error('Fetch failed:', err);
    return "I'm having trouble connecting. Please check your connection or try again soon.";
  }
};
