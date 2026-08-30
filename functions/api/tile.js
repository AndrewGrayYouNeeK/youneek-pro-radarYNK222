const ALLOWED = [
  /^https:\/\/tilecache\.rainviewer\.com\//,
  /^https:\/\/cdn[0-9]*\.rainviewer\.com\//,
];

export async function onRequestGet(context) {
  const target = new URL(context.request.url).searchParams.get("u") || "";
  if (!ALLOWED.some((rule) => rule.test(target))) {
    return new Response("Unsupported tile host", { status: 400 });
  }

  const response = await fetch(target, {
    headers: { "User-Agent": "YouNeeKProRadar/1.0 (radar-tiles)" },
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "image/png",
      "Cache-Control": "public, max-age=120",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
