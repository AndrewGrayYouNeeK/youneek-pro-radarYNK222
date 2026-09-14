import { finalizeAssetResponse } from "../worker/serveAssets.js";

function htmlRequest(path) {
  return new Request(`https://example.com${path}`);
}

function htmlResponse() {
  return new Response("<!doctype html>", {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

const landing = finalizeAssetResponse(htmlRequest("/"), htmlResponse());
if (landing.status !== 200) throw new Error("landing should stay 200");
if (!landing.headers.get("Cache-Control").includes("no-store")) {
  throw new Error("landing HTML must not be stored");
}
if (landing.headers.get("CDN-Cache-Control") !== "no-store") {
  throw new Error("landing HTML must bypass the CDN cache");
}

const staleJs = finalizeAssetResponse(
  htmlRequest("/assets/index-OLDHASH.js"),
  htmlResponse()
);
if (staleJs.status !== 404) throw new Error("SPA fallback for hashed JS must 404");

const realJs = finalizeAssetResponse(
  htmlRequest("/assets/index-NEWHASH.js"),
  new Response("console.log(1)", {
    status: 200,
    headers: { "Content-Type": "text/javascript", "Cache-Control": "public, max-age=31536000" },
  })
);
if (realJs.status !== 200) throw new Error("real JS should pass through");
if (realJs.headers.get("Cache-Control") !== "public, max-age=31536000") {
  throw new Error("hashed JS cache should be unchanged");
}

console.log("serveAssets tests passed");
