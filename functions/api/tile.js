const ALLOWED_HOSTS = new Set([
  "tilecache.rainviewer.com",
  "api.rainviewer.com",
  "cdn.star.nesdis.noaa.gov",
]);

const ALLOWED_PATTERNS = [
  /^https:\/\/tilecache\.rainviewer\.com\//,
  /^https:\/\/cdn[0-9]*\.rainviewer\.com\//,
  /^https:\/\/cdn\.star\.nesdis\.noaa\.gov\//,
];

export async function onRequestGet(context) {
  const request = context.request || context;
  const search = new URL(request.url).searchParams;
  const target = search.get("u") || search.get("url") || "";

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return Response.json({ error: "invalid url" }, { status: 400 });
  }

  const allowed =
    (parsed.protocol === "https:" && ALLOWED_HOSTS.has(parsed.hostname)) ||
    ALLOWED_PATTERNS.some((rule) => rule.test(target));

  if (!allowed) {
    return Response.json({ error: "host not allowed" }, { status: 400 });
  }

  const upstream = await fetch(parsed.toString(), {
    headers: { "User-Agent": "YouNeeKProRadar/1.0 (tile-proxy)" },
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || upstream.headers.get("Content-Type") || "image/png",
      "Cache-Control": "public, max-age=120",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
