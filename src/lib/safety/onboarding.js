import { loadShelterContacts } from "./sms.js";

export const ONBOARDED_KEY = "onboarded_v1";
export const SAFETY_SKIPPED_KEY = "safetyOnboardingSkipped_v1";

function storageFor(storage) {
  if (storage) return storage;
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

export function shouldShowSafetyOnboarding(storage) {
  try {
    return storageFor(storage)?.getItem(ONBOARDED_KEY) !== "true";
  } catch {
    return false;
  }
}

export function finishSafetyOnboarding(storage, { skipped = false } = {}) {
  const store = storageFor(storage);
  if (!store) return { skipped: false, remind: false };
  const empty = loadShelterContacts(store).length === 0;
  const remind = Boolean(skipped) && empty;
  try {
    store.setItem(ONBOARDED_KEY, "true");
    if (remind) store.setItem(SAFETY_SKIPPED_KEY, "1");
    else store.removeItem(SAFETY_SKIPPED_KEY);
  } catch {
    /* private mode */
  }
  return { skipped: remind, remind };
}

export function shouldRemindSafetyContacts(storage) {
  try {
    const store = storageFor(storage);
    if (store?.getItem(SAFETY_SKIPPED_KEY) !== "1") return false;
    return loadShelterContacts(store).length === 0;
  } catch {
    return false;
  }
}
