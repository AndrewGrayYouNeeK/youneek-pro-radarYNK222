import { useQuery } from "@tanstack/react-query";
import PageScaffold from "@/components/more/PageScaffold";
import { fetchNewsFallback, fetchWeatherNews } from "@/lib/api/news";

export default function News() {
  const { data } = useQuery({
    queryKey: ["weather-news"],
    staleTime: 120000,
    queryFn: async () => {
      try {
        return await fetchWeatherNews();
      } catch {
        return fetchNewsFallback();
      }
    },
  });
  const stories = data?.stories || [];

  return (
    <PageScaffold title="Weather news">
      <p className="text-xs text-slate-400">
        Live National Weather Service headlines. Safety-first, no video ads, no trending clutter.
      </p>
      <div className="space-y-2">
        {stories.map((story) => (
          <article key={story.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.14em] text-amber-200/70">
              {[story.event, story.severity].filter(Boolean).join(" · ")}
            </div>
            <h2 className="mt-1 text-sm font-semibold text-white">{story.title}</h2>
            {story.area && <p className="mt-1 text-[11px] text-slate-500">{story.area}</p>}
            {story.summary && <p className="mt-2 text-xs leading-relaxed text-slate-300">{story.summary}</p>}
          </article>
        ))}
        {!stories.length && <p className="text-sm text-slate-400">No national headlines available right now.</p>}
      </div>
    </PageScaffold>
  );
}
