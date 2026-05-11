import React, { useState } from 'react';
import { AlertOctagon, X, Loader2, MessageSquare, Phone, MapPin, Copy, Check } from 'lucide-react';

export default function SosButton() {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState(
    "SOS — I'm trapped and need help. My location:"
  );
  const [copied, setCopied] = useState(false);

  const openPanel = () => {
    setOpen(true);
    setError(null);
    setLoading(true);
    if (!navigator.geolocation) {
      setError('GPS not supported on this device');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          acc: pos.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Could not get GPS location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const mapsLink = coords
    ? `https://maps.google.com/?q=${coords.lat},${coords.lon}`
    : '';

  const fullMessage = coords
    ? `${message} ${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)} ${mapsLink}`
    : message;

  const smsHref = `sms:${contact}?&body=${encodeURIComponent(fullMessage)}`;
  const sms911 = `sms:911?&body=${encodeURIComponent(fullMessage)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {}
  };

  return (
    <>
      {/* Floating SOS button */}
      <button
        onClick={openPanel}
        className="fixed bottom-5 right-5 z-[200] group"
        aria-label="Emergency SOS"
      >
        <span className="absolute inset-0 rounded-full bg-[#ff0033] opacity-60 animate-ping" />
        <span className="relative flex items-center gap-2 px-4 py-3 rounded-full bg-[#ff0033] text-white font-bold text-xs tracking-[0.3em] uppercase shadow-[0_0_30px_rgba(255,0,51,0.6)] border-2 border-white/20 group-hover:bg-white group-hover:text-[#ff0033] transition">
          <AlertOctagon className="w-4 h-4" />
          SOS
        </span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md border-2 border-[#ff0033] bg-black shadow-[0_0_60px_rgba(255,0,51,0.5)]">
            <span className="absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-[#ff0033]" />
            <span className="absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-[#ff0033]" />
            <span className="absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-[#ff0033]" />
            <span className="absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-[#ff0033]" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#ff0033]/40 bg-[#ff0033]/10">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-[#ff0033] animate-pulse" />
                <span className="text-[11px] tracking-[0.3em] uppercase text-[#ff0033] font-bold font-mono">
                  // EMERGENCY_SOS
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
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
                {error && (
                  <div className="text-xs text-[#ff0033]">{error}</div>
                )}
                {coords && (
                  <div className="space-y-1 font-mono text-xs text-white">
                    <div>
                      <span className="text-white/40">LAT </span>
                      {coords.lat.toFixed(5)}°
                    </div>
                    <div>
                      <span className="text-white/40">LON </span>
                      {coords.lon.toFixed(5)}°
                    </div>
                    <div className="text-white/40 text-[10px]">
                      ±{Math.round(coords.acc)}m accuracy
                    </div>
                  </div>
                )}
              </div>

              {/* Message editor */}
              <div>
                <label className="text-[10px] tracking-[0.25em] uppercase text-white/50 font-mono">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="mt-1 w-full bg-black border border-white/15 px-3 py-2 text-xs text-white focus:border-[#ff0033] outline-none resize-none"
                />
                <div className="mt-2 text-[10px] text-white/40 font-mono">
                  Preview: <span className="text-white/70">{fullMessage}</span>
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="text-[10px] tracking-[0.25em] uppercase text-white/50 font-mono">
                  Contact Number (optional)
                </label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="+1 555 555 5555"
                  className="mt-1 w-full bg-black border border-white/15 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#ff0033] outline-none"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={smsHref}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-3 text-[10px] tracking-[0.25em] uppercase font-bold border transition ${
                    coords
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
                // Texting 911 is not available in all areas. If possible, CALL 911 first.
                // Stay calm. Conserve phone battery.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}