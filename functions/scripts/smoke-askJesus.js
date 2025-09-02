import fetch from 'node-fetch';

(async () => {
  const url = process.env.CLOUD_RUN_URL + '/askJesus';
  const idToken = process.env.TEST_ID_TOKEN || '';

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
    },
    body: JSON.stringify({ text: 'Hello', uid: 'test-uid', model: 'gemini-1.5-pro' })
  });

  const t = await r.text();
  console.log('status:', r.status);
  console.log('body:', t);
  process.exit(r.ok ? 0 : 1);
})();
