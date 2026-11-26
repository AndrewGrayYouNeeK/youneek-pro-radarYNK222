import { PUSH_EVENTS, alertId, deviceMatchesAlert, pushableAlerts } from "./match.js";
import { pushConfig, sendToDevice } from "./senders.js";
import { listDevices, readProgress, readSentIds, writeProgress, writeSentIds } from "./store.js";

const NWS_HEADERS = { Accept: "application/geo+json", "User-Agent": "YouNeeKProRadar/1.0 (push alerts; andrewgray@youneek.xyz)" };
const SEND_CONCURRENCY = 10;
// Workers Free allows 50 subrequests per run; set PUSH_MAX_SENDS higher on a paid plan.
// Sends that do not fit carry over to the next run (progress key), so nobody is skipped.
const DEFAULT_MAX_SENDS = 40;

export function maxSends(env = {}) {
  const value = Number(env.PUSH_MAX_SENDS);
  return Number.isFinite(value) && value >= 1 ? Math.min(Math.floor(value), 900) : DEFAULT_MAX_SENDS;
}

export async function fetchWarnings(fetchImpl = fetch) {
  const url = `https://api.weather.gov/alerts/active?status=actual&message_type=alert&event=${PUSH_EVENTS.map(encodeURIComponent).join(",")}`;
  const response = await fetchImpl(url, { headers: NWS_HEADERS });
  if (!response.ok) throw new Error(`NWS ${response.status}`);
  const data = await response.json();
  return data?.features || [];
}

/**
 * One cron tick. Safe to run with no KV or no push secrets: it returns early and sends nothing.
 * Each alert ID is pushed once (dedupe set in KV).
 */
export async function runPushCron(env = {}, { fetchImpl = fetch, now = Date.now(), log = () => {} } = {}) {
  const kv = env.PUSH_KV;
  const config = pushConfig(env);
  if (!kv) return { status: "no-kv", sent: 0 };
  if (!config.apns && !config.fcm) return { status: "no-secrets", sent: 0, missing: config.missing };

  const alerts = pushableAlerts(await fetchWarnings(fetchImpl), now);
  const sentIds = await readSentIds(kv);
  const fresh = alerts.filter((feature) => !sentIds.has(alertId(feature)));
  if (!fresh.length) return { status: "nothing-new", sent: 0 };

  const devices = await listDevices(kv);
  const progress = await readProgress(kv);
  const jobs = [];
  for (const feature of fresh) {
    const done = new Set(progress[alertId(feature)] || []);
    for (const device of devices) {
      if (!done.has(device.key) && deviceMatchesAlert(device, feature)) jobs.push({ device, feature });
    }
  }

  let sent = 0;
  let failed = 0;
  const gone = new Set();
  const queue = jobs.slice(0, maxSends(env));
  let index = 0;
  await Promise.all(
    Array.from({ length: Math.min(SEND_CONCURRENCY, queue.length) }, async () => {
      while (index < queue.length) {
        const { device, feature } = queue[index];
        index += 1;
        const result = await sendToDevice(env, config, device, feature, { fetchImpl, now });
        if (result.ok) sent += 1;
        else if (!result.skipped) failed += 1;
        if (result.gone) gone.add(device.key);
      }
    })
  );

  for (const key of gone) await kv.delete(key);

  // An alert is finished when none of its jobs were left over for the next run.
  const leftover = new Set(jobs.slice(queue.length).map((job) => alertId(job.feature)));
  const nextProgress = {};
  let finished = 0;
  for (const feature of fresh) {
    const id = alertId(feature);
    if (leftover.has(id)) {
      const done = new Set(progress[id] || []);
      queue.filter((job) => alertId(job.feature) === id).forEach((job) => done.add(job.device.key));
      nextProgress[id] = [...done];
    } else {
      sentIds.add(id);
      finished += 1;
    }
  }
  if (finished) await writeSentIds(kv, sentIds);
  if (Object.keys(nextProgress).length || Object.keys(progress).length) await writeProgress(kv, nextProgress);
  log(`push: ${fresh.length} new warnings, ${jobs.length} matches, ${sent} sent, ${failed} failed, ${gone.size} dead tokens removed`);
  return { status: "ran", alerts: fresh.length, matches: jobs.length, sent, failed, removed: gone.size, carriedOver: jobs.length - queue.length };
}
