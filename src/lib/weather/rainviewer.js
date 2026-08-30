export async function fetchRainViewerCatalog() {
  const response = await fetch("/api/rainviewer");
  if (!response.ok) throw new Error("Radar catalog unavailable");
  return response.json();
}

export function rainViewerTileUrl(frame, z, x, y, color = 2) {
  return `${frame.host}${frame.path}/256/${z}/${x}/${y}/${color}/1_1.png`;
}

export function rainViewerLeafletUrl(frame, color = 2) {
  return `${frame.host}${frame.path}/256/{z}/{x}/{y}/${color}/1_1.png`;
}

export function proxiedTileUrl(url) {
  return `/api/tile?u=${encodeURIComponent(url)}`;
}

export function loadCorsImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`tile failed ${url}`));
    image.src = url;
  });
}

export async function buildMercatorMosaic(frame, zoom = 2, color = 2) {
  const size = 2 ** zoom;
  const tile = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size * tile;
  canvas.height = size * tile;
  const context = canvas.getContext("2d", { alpha: true });
  context.clearRect(0, 0, canvas.width, canvas.height);

  const jobs = [];
  for (let x = 0; x < size; x += 1) {
    for (let y = 0; y < size; y += 1) {
      const direct = rainViewerTileUrl(frame, zoom, x, y, color);
      jobs.push(
        loadCorsImage(direct)
          .catch(() => loadCorsImage(proxiedTileUrl(direct)))
          .then((image) => {
            context.drawImage(image, x * tile, y * tile, tile, tile);
          })
          .catch(() => {})
      );
    }
  }

  await Promise.all(jobs);
  return canvas;
}

export function formatRadarClock(unixSeconds) {
  if (!unixSeconds) return "Live";
  return new Date(unixSeconds * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
