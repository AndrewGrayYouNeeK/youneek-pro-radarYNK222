import { rainviewerTileUrl } from "./rainviewer";

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`tile failed: ${url}`));
    image.src = url;
  });
}

async function loadImageWithProxy(url) {
  try {
    return await loadImage(url);
  } catch {
    const proxy = `/api/tile?u=${encodeURIComponent(url)}`;
    return loadImage(proxy);
  }
}

export async function stitchRainviewerFrame({ host, path, zoom = 2, size = 256 }) {
  const count = 2 ** zoom;
  const canvas = document.createElement("canvas");
  canvas.width = count * size;
  canvas.height = count * size;
  const context = canvas.getContext("2d", { alpha: true });
  context.clearRect(0, 0, canvas.width, canvas.height);

  const jobs = [];
  for (let x = 0; x < count; x += 1) {
    for (let y = 0; y < count; y += 1) {
      const url = rainviewerTileUrl(host, path, zoom, x, y, size);
      jobs.push(
        loadImageWithProxy(url)
          .then((image) => {
            context.drawImage(image, x * size, y * size, size, size);
          })
          .catch(() => {})
      );
    }
  }

  await Promise.all(jobs);
  return canvas;
}
