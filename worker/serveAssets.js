const HTML_NO_STORE = "no-cache, no-store, must-revalidate";
const STATIC_FILE = /\.(js|css|map|mjs|woff2?|ttf|otf|png|jpe?g|gif|svg|webp|ico|json|txt|wasm|webmanifest)$/i;

function isHtmlResponse(response) {
  return (response.headers.get("content-type") || "").includes("text/html");
}

/**
 * SPA fallback would otherwise 200 index.html for a stale hashed /assets/*.js
 * request, so a cached landing shell never boots the new bundle.
 */
export function finalizeAssetResponse(request, response) {
  const { pathname } = new URL(request.url);
  const html = isHtmlResponse(response);

  if (html && STATIC_FILE.test(pathname)) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  if (html) {
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", HTML_NO_STORE);
    headers.set("CDN-Cache-Control", "no-store");
    headers.set("Cloudflare-CDN-Cache-Control", "no-store");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
}
