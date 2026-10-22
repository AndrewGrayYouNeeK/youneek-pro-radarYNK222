export default function TempChart({ points = [], color = "#38bdf8" }) {
  const values = points.map((point) => Number(point.value)).filter((value) => Number.isFinite(value));
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const width = 640;
  const height = 140;
  const step = width / (values.length - 1);
  const coords = values.map((value, index) => {
    const x = index * step;
    const y = height - 16 - ((value - min) / span) * (height - 32);
    return [x, y];
  });
  const line = coords.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full" role="img" aria-label="Temperature chart">
      <polygon points={area} fill={color} opacity="0.18" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}
