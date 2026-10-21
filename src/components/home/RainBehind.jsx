const DROPS = Array.from({ length: 42 }, (_, id) => ({
  id,
  left: (id * 37) % 100,
  delay: (id % 8) * 0.18,
  duration: 0.7 + (id % 5) * 0.15,
  opacity: 0.18 + (id % 4) * 0.08,
  height: 42 + (id % 6) * 14,
}));

export default function RainBehind() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {DROPS.map((drop) => (
        <span
          key={drop.id}
          className="ynk-rain-drop absolute top-0 bg-gradient-to-b from-transparent via-[#9effe0] to-transparent"
          style={{
            left: `${drop.left}%`,
            height: `${drop.height}px`,
            width: "1px",
            opacity: drop.opacity,
            animationDuration: `${drop.duration}s`,
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
