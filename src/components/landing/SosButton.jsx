import React, { useEffect, useState } from 'react';
import { AlertOctagon, X, Loader2, MessageSquare, Phone, MapPin, Copy, Check, Settings, Save, Tornado } from 'lucide-react';
import useTornadoNearby from './useTornadoNearby';
import { useLocation, DEFAULT_SOS } from './LocationContext';

export default function SosButton() {
  const { sos, setSos, gpsFix, location, locating } = useLocation();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('sos'); // 'sos' | 'settings'
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState(sos || DEFAULT_SOS);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { inWarning, warning } = useTornadoNearby();

  useEffect(() => {
    setDraft(sos || DEFAULT_SOS);
  }, [sos]);

  const saveProfile = () => {
    setSos(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const openPanel = () => {
    setOpen(true);
    setMode('sos');
    setError(null);
  };

  const coords = gpsFix || (location?.lat != null ? { lat: location.lat, lon: location.lon, accuracy: location.accuracy } : null);
  const loading = locating && !coords;
  const profile = sos || DEFAULT_SOS;
  const mapsLink = coords ? `https://maps.google.com/?q=${coords.lat},${coords.lon}` : '';
  const namePart = profile.name ? `[${profile.name}] ` : '';
  const fullMessage = coords
    ? `${namePart}${profile.message} ${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)} ${mapsLink}`
    : `${namePart}${profile.message}`;

  const smsHref = `sms:${profile.contact}?&body=${encodeURIComponent(fullMessage)}`;
  const sms911 = `sms:911?&body=${encodeURIComponent(fullMessage)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  const areaDesc = warning?.properties?.areaDesc || '';

  return (
    <>
      {/* Floating SOS — id used by the tornado banner #sos jump */}
      <div id="sos" className="fixed bottom-5 right-5 z-[200]">
      {inWarning && (
        <button
          onClick={openPanel}
          className="group relative"
          aria-label="Emergency SOS — Tornado Warning in your area"
        >
          <span className="absolute inset-0 rounded-full bg-[#ff0033] opacity-60 animate-ping" />
          <span className="relative flex items-center gap-2 px-4 py-3 rounded-full bg-[#ff0033] text-white font-bold text-xs tracking-[0.3em] uppercase shadow-[0_0_30px_rgba(255,0,51,0.6)] border-2 border-white/20 group-hover:bg-white group-hover:text-[#ff0033] transition">
            <Tornado className="w-4 h-4" />
            SOS
          </span>
          {areaDesc && (
            <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap text-[9px] tracking-[0.2em] uppercase font-mono text-[#ff0033] bg-black/80 border border-[#ff0033]/50 px-2 py-1">
              ⚠ TOR WARN: {areaDesc.split(';')[0]}
            </span>
          )}
        </button>
      )}

      {/* Small discreet "setup" button when no tornado — lets users pre-fill ahead of time */}
      {!inWarning && (
        <button
          onClick={() => { setOpen(true); setMode('settings'); }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur border border-white/20 text-white/50 hover:text-[#00ff9c] hover:border-[#00ff9c]/50 text-[9px] tracking-[0.25em] uppercase font-mono transition"
          aria-label="Pre-configure SOS"
        >
          <Settings className="w-3 h-3" /> SOS_SETUP
        </button>
      )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md border-2 border-[#ff0033] bg-black shadow-[0_0_60px_rgba(255,0,51,0.5)] max-h-[90vh] overflow-y-auto">
            <span className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-[#ff0033]" />
            <span className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-[#ff0033]" />
            <span className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-[#ff0033]" />
            <span className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-[#ff0033]" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#ff0033]/40 bg-[#ff0033]/10 sticky top-0">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-[#ff0033] animate-pulse" />
                <span className="text-[11px] tracking-[0.3em] uppercase text-[#ff0033] font-bold font-mono">
                  // {mode === 'sos' ? 'EMERGENCY_SOS' : 'SOS_SETUP'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode(mode === 'sos' ? 'settings' : 'sos')}
                  className="text-white/60 hover:text-[#00ff9c]"
                  title={mode === 'sos' ? 'Edit profile' : 'Back to SOS'}
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {mode === 'sos' && (
              <div className="p-4 space-y-4">
                {/* Setup nudge */}
                {!profile.contact && (
                  <button
                    onClick={() => setMode('settings')}
                    className="w-full border border-[#00ff9c]/40 bg-[#00ff9c]/5 text-[#00ff9c] px-3 py-2 text-[10px] tracking-[0.25em] uppercase font-mono hover:bg-[#00ff9c]/10 text-left"
                  >
                    → Tap to pre-fill your emergency contact & message
                  </button>
                )}

                {/* GPS status */}
                <div className="border border-white/10 bg-black/60 p-3">
                  <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-[#00ff9c] font-mono mb-2">
                    <MapPin className="w-3 h-3" />
                    GPS_FIX
                  </div>
                  {loading && (
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Locking onto satellites…
                    </div>
                  )}
                  {error && <div className="text-xs text-[#ff0033]">{error}</div>}
            {!coords && !loading && (
              <div className="text-xs text-[#ffea00]">Waiting for GPS — allow location in the browser.</div>
            )}
                  {coords && (
                    <div className="space-y-1 font-mono text-xs text-white">
                      <div><span className="text-white/40">LAT </span>{coords.lat.toFixed(5)}°</div>
                      <div><span className="text-white/40">LON </span>{coords.lon.toFixed(5)}°</div>
                      <div className="text-white/40 text-[10px]">±{Math.round(coords.accuracy || 0)}m accuracy</div>
                    </div>
                  )}
                </div>

                {/* Message preview */}
                <div className="border border-white/10 bg-black/60 p-3">
                  <div className="text-[10px] tracking-[0.25em] uppercase text-white/50 font-mono mb-2">
                    Outgoing Message
                  </div>
                  <div className="text-xs text-white/90 leading-relaxed font-mono break-words">
                    {fullMessage}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={smsHref}
                    className={`inline-flex items-center justify-center gap-2 px-3 py-3 text-[10px] tracking-[0.25em] uppercase font-bold border transition ${
                      coords && profile.contact
                        ? 'bg-[#ff0033] text-white border-[#ff0033] hover:bg-white hover:text-[#ff0033]'
                        : 'bg-white/5 text-white/30 border-white/10 pointer-events-none'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Text Contact
                  </a>
                  <a
                    href={sms911}
                    className={`inline-flex items-center justify-center gap-2 px-3 py-3 text-[10px] tracking-[0.25em] uppercase font-bold border transition ${
                      coords
                        ? 'bg-black text-[#ff0033] border-[#ff0033] hover:bg-[#ff0033] hover:text-white'
                        : 'bg-white/5 text-white/30 border-white/10 pointer-events-none'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Text 911
                  </a>
                  <a
                    href="tel:911"
                    className="inline-flex items-center justify-center gap-2 px-3 py-3 text-[10px] tracking-[0.25em] uppercase font-bold border bg-black text-white border-white/30 hover:border-[#ff0033] hover:text-[#ff0033] transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call 911
                  </a>
                  <button
                    onClick={copy}
                    disabled={!coords}
                    className="inline-flex items-center justify-center gap-2 px-3 py-3 text-[10px] tracking-[0.25em] uppercase font-bold border bg-black text-white border-white/30 hover:border-[#00ff9c] hover:text-[#00ff9c] transition disabled:opacity-40"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="text-[9px] text-white/40 font-mono leading-relaxed border-t border-white/10 pt-3">
                  // Texting 911 is not available in all areas. If possible, CALL 911 first.<br />
                  // Stay calm. Conserve phone battery.
                </div>
              </div>
            )}

            {mode === 'settings' && (
              <div className="p-4 space-y-4">
                <div className="text-[10px] text-white/60 font-mono leading-relaxed border border-[#00ff9c]/20 bg-[#00ff9c]/5 p-3">
                  Pre-fill once. When you hit SOS, your message + GPS location is ready to send instantly — no typing required.
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.25em] uppercase text-white/50 font-mono">Your Name</label>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1 w-full bg-black border border-white/15 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#00ff9c] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.25em] uppercase text-white/50 font-mono">Emergency Contact #</label>
                  <input
                    value={draft.contact}
                    onChange={(e) => setDraft({ ...draft, contact: e.target.value })}
                    placeholder="+1 555 555 5555"
                    type="tel"
                    className="mt-1 w-full bg-black border border-white/15 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#00ff9c] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.25em] uppercase text-white/50 font-mono">Custom Message</label>
                  <textarea
                    value={draft.message}
                    onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                    rows={3}
                    className="mt-1 w-full bg-black border border-white/15 px-3 py-2 text-xs text-white focus:border-[#00ff9c] outline-none resize-none"
                  />
                  <div className="mt-1 text-[9px] text-white/40 font-mono">
                    GPS coordinates + Google Maps link auto-appended.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={saveProfile}
                    className="inline-flex items-center justify-center gap-2 px-3 py-3 text-[10px] tracking-[0.25em] uppercase font-bold bg-[#00ff9c] text-black hover:bg-white transition"
                  >
                    {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    {saved ? 'Saved' : 'Save Profile'}
                  </button>
                  <button
                    onClick={() => setMode('sos')}
                    className="inline-flex items-center justify-center gap-2 px-3 py-3 text-[10px] tracking-[0.25em] uppercase font-bold border border-white/30 text-white hover:border-[#ff0033] hover:text-[#ff0033] transition"
                  >
                    Back to SOS
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}