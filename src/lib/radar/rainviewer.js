const RAINVIEWER_MAPS = "https://api.rainviewer.com/public/weather-maps.json";

export async function fetchRainviewerMaps() {
  const response = await fetch(RAINVIEWER_MAPS);
  if (!response.ok) throw new Error("RainViewer maps unavailable");
  const payload = await response.json();
  const host = payload.host || "https://tilecache.rainviewer.com";
  const past = payload?.radar?.past || [];
  const nowcast = payload?.radar?.nowcast || [];
  const infrared = payload?.satellite?.infrared || [];

  const toFrame = (frame, kind) => ({
    time: frame.time,
    path: frame.path,
    kind,
    tileUrl: `${host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
  });

  return {
    host,
    radar: [...past, ...nowcast].map((frame, index) =>
      toFrame(frame, index >= past.length ? "nowcast" : "past")
    ),
    liveIndex: Math.max(0, past.length - 1),
    satellite: infrared.map((frame) => toFrame(frame, "satellite")),
    generated: payload.generated,
  };
}

export function rainviewerTileUrl(host, path, z, x, y, size = 256) {
  return `${host}${path}/${size}/${z}/${x}/${y}/2/1_1.png`;
}

export function pickLoopFrames(frames, maxFrames = 8) {
  if (!frames.length) return [];
  if (frames.length <= maxFrames) return frames;
  const step = Math.ceil(frames.length / maxFrames);
  const picked = [];
  for (let index = 0; index < frames.length; index += step) {
    picked.push(frames[index]);
  }
  const last = frames[frames.length - 1];
  if (picked[picked.length - 1] !== last) picked.push(last);
  return picked;
}
