const ALLOWED_HOSTS = new Set([
  "tilecache.rainviewer.com",
  "api.rainviewer.com",
  "cdn.star.nesdis.noaa.gov",
]);

export async function onRequestGet({ request }) {
  const target = new URL(request.url).searchParams.get("url");
  if (!target) {
    return Response.json({ error: "url is required" }, { status: 400 });
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return Response.json({ error: "invalid url" }, { status: 400 });
  }

  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return Response.json({ error: "host not allowed" }, { status: 400 });
  }

  const upstream = await fetch(parsed.toString(), {
    headers: { "User-Agent": "YouNeeKProRadar/1.0 (tile-proxy)" },
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "image/png",
      "Cache-Control": "public, max-age=120",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
