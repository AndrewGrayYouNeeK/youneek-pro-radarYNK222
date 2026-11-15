import { ExternalLink } from "lucide-react";

export const YOUNEEK_SITE_URL = "https://youneek.xyz";

export function openYouneekSite(event) {
  event?.preventDefault?.();
  const browser = globalThis.window;
  if (!browser || typeof browser.open !== "function") return false;
  const popup = browser.open(YOUNEEK_SITE_URL, "_blank", "noopener,noreferrer");
  if (popup) popup.opener = null;
  return true;
}

export default function MoreFromYouneekRow() {
  return (
    <a
      href={YOUNEEK_SITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={openYouneekSite}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-white transition-colors hover:bg-white/5 active:bg-white/10"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <ExternalLink className="h-4 w-4 text-[#00ff9c]" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium leading-tight">More from YouNeeK</div>
        <div className="mt-0.5 text-xs leading-snug text-slate-400">Other apps by Andrew Gray</div>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-[#00ff9c]" aria-hidden="true" />
    </a>
  );
}
