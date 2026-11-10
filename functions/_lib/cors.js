export const NATIVE_APP_ORIGINS = ["capacitor://localhost", "ionic://localhost"];

export function allowedCorsOrigin(request) {
  const origin = request?.headers?.get?.("origin") || request?.headers?.get?.("Origin") || "";
  return NATIVE_APP_ORIGINS.includes(origin) ? origin : "";
}

export function corsHeaders(request) {
  const origin = allowedCorsOrigin(request);
  const headers = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export function applyCors(request, response) {
  const headers = new Headers(response.headers);
  headers.delete("Access-Control-Allow-Origin");
  const extra = corsHeaders(request);
  Object.entries(extra).forEach(([key, value]) => {
    if (value) headers.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function jsonWithCors(body, init = {}, request) {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    ...corsHeaders(request),
    ...(init.headers || {}),
  };
  return Response.json(body, { ...init, headers });
}
