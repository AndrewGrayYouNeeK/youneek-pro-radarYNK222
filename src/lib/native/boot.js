import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { installNativeGeolocation } from "@/lib/native/geolocationBridge";
import { installApiFetch } from "@/lib/native/installApiFetch";
import { bridgePreferences } from "@/lib/native/preferencesBridge";
import { installReviewLink } from "@/lib/native/reviewLink";
import { isNativePlatform } from "@/lib/native/runtime";

async function styleNativeChrome() {
  if (!isNativePlatform()) return;
  try {
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#020617" });
  } catch {
    /* Status bar styling is cosmetic. */
  }
  try {
    await SplashScreen.hide();
  } catch {
    /* Splash may already be hidden. */
  }
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    }),
  ]);
}

export async function bootNativeShell() {
  installApiFetch();
  installNativeGeolocation();
  await withTimeout(
    (async () => {
      await bridgePreferences();
      await installReviewLink();
    })(),
    4000
  );
  await styleNativeChrome();
}
