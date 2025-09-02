export async function askJesusApi(url: string, userInput: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: userInput })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`askJesus ${res.status}: ${text}`);
  }
  return res.json();
}
