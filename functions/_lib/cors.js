export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function jsonWithCors(body, init = {}) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    ...corsHeaders(),
    ...(init.headers || {}),
  };
  return Response.json(body, { ...init, headers });
}
