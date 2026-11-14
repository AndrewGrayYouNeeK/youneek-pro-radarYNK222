export const LOOP_FRAME_COUNTS = [4, 6, 8, 12];
export const LOOP_SPEEDS = [180, 400, 800];
export const LOOP_SPEED_KEY = "pref_loopSpeed";
export const LOOP_FRAMES_KEY = "pref_loopFrames";

export function clampLoopFrames(value) {
  const count = Number(value);
  return LOOP_FRAME_COUNTS.includes(count) ? count : 8;
}

export function clampLoopSpeed(value) {
  const speed = Number(value);
  return LOOP_SPEEDS.includes(speed) ? speed : 400;
}

function storageOr(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

export function loadLoopSpeed(storage) {
  const store = storageOr(storage);
  try {
    return clampLoopSpeed(store?.getItem(LOOP_SPEED_KEY));
  } catch {
    return 400;
  }
}

export function saveLoopSpeed(value, storage) {
  const next = clampLoopSpeed(value);
  const store = storageOr(storage);
  try {
    store?.setItem(LOOP_SPEED_KEY, String(next));
  } catch {
    /* ignore private mode */
  }
  return next;
}

export function loadLoopFrameCount(storage) {
  const store = storageOr(storage);
  try {
    return clampLoopFrames(store?.getItem(LOOP_FRAMES_KEY));
  } catch {
    return 8;
  }
}

export function saveLoopFrameCount(value, storage) {
  const next = clampLoopFrames(value);
  const store = storageOr(storage);
  try {
    store?.setItem(LOOP_FRAMES_KEY, String(next));
  } catch {
    /* ignore private mode */
  }
  return next;
}

export function buildRadarLoop(past = [], nowcast = [], { includeFuture = false, maxFrames = 8 } = {}) {
  const limit = clampLoopFrames(maxFrames);
  const history = (past || []).filter((frame) => frame?.tileUrl).slice(-limit).map((frame) => ({
    ...frame,
    kind: "past",
    extrapolated: false,
  }));

  if (!includeFuture) {
    return { source: "past", frames: history };
  }

  const official = (nowcast || []).filter((frame) => frame?.tileUrl);
  if (official.length) {
    return {
      source: "rainviewer-nowcast",
      frames: [
        ...history,
        ...official.map((frame) => ({ ...frame, kind: "future", extrapolated: false })),
      ],
    };
  }

  if (history.length < 2) {
    return { source: "past-only", frames: history };
  }

  const last = history[history.length - 1];
  const previous = history[history.length - 2];
  const step = Math.max(60, Number(last.time) - Number(previous.time) || 600);
  const future = history.slice(-4).map((frame, index) => ({
    ...frame,
    kind: "future",
    extrapolated: true,
    time: Number(last.time) + step * (index + 1),
  }));
  return { source: "extrapolated-recent-frames", frames: [...history, ...future] };
}

export function syncFrameLayers(existing = [], frames = []) {
  const urls = frames.map((frame) => frame.tileUrl);
  const same = existing.length === urls.length && existing.every((layer, index) => layer.tileUrl === urls[index]);
  if (same) return { rebuilt: false, layers: existing };
  return {
    rebuilt: true,
    layers: urls.map((tileUrl) => ({ tileUrl, opacity: 0 })),
  };
}

export function opacitiesForIndex(layers = [], index = 0, visibleOpacity = 0.8) {
  return layers.map((layer, layerIndex) => ({
    tileUrl: layer.tileUrl,
    opacity: layerIndex === index ? visibleOpacity : 0,
  }));
}
