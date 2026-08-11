export async function invokeNwsData(params) {
  const res = await fetch('/api/nws', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `API error ${res.status}`);
  return json;
}
