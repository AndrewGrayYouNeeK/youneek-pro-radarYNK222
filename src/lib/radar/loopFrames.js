export function buildRadarLoop(past = [], nowcast = [], { includeFuture = false } = {}) {
  const history = (past || []).filter((frame) => frame?.tileUrl).slice(-8).map((frame) => ({
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
