import { PREMIUM_UNLOCKED } from "@/lib/premium";

/** Renders children in the native app. On the web preview renders `fallback` (default nothing). */
export default function PremiumOnly({ children, fallback = null, premium = PREMIUM_UNLOCKED }) {
  return premium ? children : fallback;
}
