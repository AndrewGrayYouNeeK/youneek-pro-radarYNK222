export function meteorologicalVector(directionDeg, speed) {
  const radians = (Number(directionDeg) * Math.PI) / 180;
  const magnitude = Number(speed);
  if (!Number.isFinite(radians) || !Number.isFinite(magnitude)) {
    return { east: 0, north: 0 };
  }
  return {
    east: -magnitude * Math.sin(radians),
    north: -magnitude * Math.cos(radians),
  };
}

export function advectDegrees(lat, lon, east, north, seconds) {
  const metersPerDegree = 111320;
  const latitude = Number(lat);
  const longitude = Number(lon);
  const cos = Math.cos((latitude * Math.PI) / 180) || 1;
  return {
    lat: latitude + (north * seconds) / metersPerDegree,
    lon: longitude + (east * seconds) / (metersPerDegree * cos),
  };
}
