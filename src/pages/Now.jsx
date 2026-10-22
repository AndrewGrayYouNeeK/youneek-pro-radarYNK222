import ForecastLayout from "@/components/home/ForecastLayout";
import WeatherHome from "@/components/home/WeatherHome";
import useTabPageMemory from "@/hooks/useTabPageMemory";

export default function Now() {
  useTabPageMemory("Now");
  return (
    <ForecastLayout title="Now">
      <WeatherHome />
    </ForecastLayout>
  );
}
