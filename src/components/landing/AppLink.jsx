import { Link } from "react-router-dom";
import { appHref } from "@/lib/sites";

export default function AppLink({ to, children, ...props }) {
  const href = appHref(to);
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link to={href} {...props}>
      {children}
    </Link>
  );
}
