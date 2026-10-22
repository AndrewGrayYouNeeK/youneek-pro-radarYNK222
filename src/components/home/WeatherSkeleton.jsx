function Block({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />;
}

export default function WeatherSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading weather">
      <Block className="h-28" />
      <Block className="h-80 rounded-3xl" />
      <Block className="h-36" />
      <Block className="h-24" />
      <Block className="h-64" />
    </div>
  );
}
