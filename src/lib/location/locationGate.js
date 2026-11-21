// Holds location requests until first-launch safety contacts setup is done, so the
// system "Allow location" prompt never appears over (or before) that screen.
// Calls made while held are queued and replayed in order on release.

let held = false;
let original = null;
let queue = [];
let nextGateId = 1;
const realWatchIds = new Map(); // gateId -> real watch id

export function isLocationGateHeld() {
  return held;
}

export function installLocationGate(geo, { hold = false } = {}) {
  held = Boolean(hold);
  queue = [];
  realWatchIds.clear();
  if (!geo) return false;
  original = {
    getCurrentPosition: geo.getCurrentPosition.bind(geo),
    watchPosition: geo.watchPosition.bind(geo),
    clearWatch: geo.clearWatch.bind(geo),
  };
  try {
    geo.getCurrentPosition = (success, error, options) => {
      if (held) {
        queue.push({ kind: "get", args: [success, error, options] });
        return undefined;
      }
      return original.getCurrentPosition(success, error, options);
    };
    geo.watchPosition = (success, error, options) => {
      const gateId = nextGateId;
      nextGateId += 1;
      if (held) queue.push({ kind: "watch", gateId, args: [success, error, options] });
      else realWatchIds.set(gateId, original.watchPosition(success, error, options));
      return gateId;
    };
    geo.clearWatch = (gateId) => {
      const before = queue.length;
      queue = queue.filter((item) => item.gateId !== gateId);
      if (queue.length !== before) return;
      if (realWatchIds.has(gateId)) {
        original.clearWatch(realWatchIds.get(gateId));
        realWatchIds.delete(gateId);
      }
    };
    return true;
  } catch {
    // Geolocation object not writable: requests go straight through.
    held = false;
    return false;
  }
}

export function holdLocationGate() {
  held = true;
}

export function releaseLocationGate() {
  if (!held) return;
  held = false;
  const pending = queue;
  queue = [];
  for (const item of pending) {
    if (item.kind === "get") original?.getCurrentPosition(...item.args);
    else realWatchIds.set(item.gateId, original?.watchPosition(...item.args));
  }
}
