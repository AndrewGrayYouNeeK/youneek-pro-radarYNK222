import { Link } from "react-router-dom";
import { weatherHref } from "@/lib/weatherApp";

/** Opens the youneekproradar.com weather app in production; stays in-app on localhost. */
export default function WeatherLink({ to, className, children, onClick }) {
  const href = weatherHref(to);
  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
