// RN-safe JSON POST helper
export async function postJSON(url: string, body: Record<string, any>, idToken?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

  // IMPORTANT: always stringify
  const resp = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body ?? {}),
  });

  const text = await resp.text();
  let data: any;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (!resp.ok) {
    const err = new Error(`HTTP ${resp.status}`);
    (err as any).status = resp.status;
    (err as any).response = data;
    throw err;
  }
  return data;
}
