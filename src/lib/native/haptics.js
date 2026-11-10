import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { isNativePlatform } from "@/lib/native/runtime";

const fired = new Set();

export async function hapticImpact() {
  if (!isNativePlatform()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {
    /* Simulators often have no haptic engine. */
  }
}

export async function hapticSevereWarning(key) {
  if (!isNativePlatform()) return;
  const id = String(key || "severe");
  if (fired.has(id)) return;
  fired.add(id);
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {
    /* Simulators often have no haptic engine. */
  }
}
