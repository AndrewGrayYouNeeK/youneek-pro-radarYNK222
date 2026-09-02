import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import BottomTab from "@/components/radar/BottomTab";
import AppHeader from "@/components/mobile/AppHeader";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import { UserPlus, Trash2, Download, Upload, Phone, User, Shield, AlertTriangle } from "lucide-react";
import SafetyTextActions from "@/components/safety/SafetyTextActions";

// ── Storage helpers ────────────────────────────────────────────────────────
const STORAGE_KEY = "shelterContacts_v2";

function loadContacts() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveContacts(contacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  // Mirror to legacy key so ShelterAlert still works
  const phones = contacts.map((c) => c.phone).filter(Boolean);
  localStorage.setItem("shelterContacts", JSON.stringify(phones));
}

// ── Validation ─────────────────────────────────────────────────────────────
function cleanPhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === "1") return `+${digits}`;
  return null;
}
function formatDisplay(phone) {
  const d = phone.replace(/\D/g, "").replace(/^1/, "");
  if (d.length !== 10) return phone;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}

export default function Contacts() {
  useTabPageMemory("More");
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const { data: contacts = [] } = useQuery({
    queryKey: ["shelterContacts_v2"],
    queryFn: loadContacts,
    initialData: loadContacts,
  });

  const addMutation = useMutation({
    mutationFn: async (contact) => {
      const current = queryClient.getQueryData(["shelterContacts_v2"]) || [];
      const next = [...current, contact];
      saveContacts(next);
      return next;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["shelterContacts_v2"] });
      const prev = queryClient.getQueryData(["shelterContacts_v2"]) || [];
      setName(""); setPhone(""); setError("");
      return { prev };
    },
    onSuccess: (next) => queryClient.setQueryData(["shelterContacts_v2"], next),
    onError: (_, __, ctx) => queryClient.setQueryData(["shelterContacts_v2"], ctx?.prev || []),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["shelterContacts_v2"] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id) => {
      const next = (queryClient.getQueryData(["shelterContacts_v2"]) || []).filter((c) => c.id !== id);
      saveContacts(next);
      return next;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["shelterContacts_v2"] });
      const prev = queryClient.getQueryData(["shelterContacts_v2"]) || [];
      queryClient.setQueryData(["shelterContacts_v2"], prev.filter((c) => c.id !== id));
      return { prev };
    },
    onError: (_, __, ctx) => queryClient.setQueryData(["shelterContacts_v2"], ctx?.prev || []),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["shelterContacts_v2"] }),
  });

  const handleAdd = () => {
    if (addMutation.isPending) return;
    const trimName = name.trim();
    const cleaned = cleanPhone(phone);
    if (!trimName) { setError("Enter a name."); return; }
    if (!cleaned) { setError("Enter a valid 10-digit US number."); return; }
    if (contacts.some((c) => c.phone === cleaned)) { setError("That number is already saved."); return; }
    if (contacts.length >= 5) { setError("Max 5 shelter contacts."); return; }
    addMutation.mutate({ id: Date.now().toString(), name: trimName, phone: cleaned });
  };

  // Export contacts as JSON file for backup
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(contacts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "shelter-contacts-backup.json"; a.click();
    URL.revokeObjectURL(url);
  };

  // Import from backup JSON
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error("Invalid format");
        const valid = parsed.filter((c) => c.id && c.name && c.phone);
        // Merge, dedup by phone
        const existing = queryClient.getQueryData(["shelterContacts_v2"]) || [];
        const existingPhones = new Set(existing.map((c) => c.phone));
        const merged = [...existing, ...valid.filter((c) => !existingPhones.has(c.phone))].slice(0, 5);
        saveContacts(merged);
        queryClient.setQueryData(["shelterContacts_v2"], merged);
      } catch {
        setError("Couldn't read that file — make sure it's a valid backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950 text-white">
      <AppHeader title="Contacts" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-5">
      <div className="mx-auto max-w-md space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Shelter Contacts</h1>
          <p className="mt-1 text-sm text-slate-400">
            These people get Emergency and I&apos;m Safe texts with your GPS location. Drafts open in Messages — nothing sends until you tap Send.
          </p>
        </div>

        {/* Add form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Add Contact</div>
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder="Name"
                aria-label="Contact name"
                className="w-full rounded-xl border border-white/10 bg-slate-900 pl-9 pr-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden="true" />
              <input
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder="(555) 867-5309"
                aria-label="Contact phone number"
                inputMode="tel"
                type="tel"
                className="w-full rounded-xl border border-white/10 bg-slate-900 pl-9 pr-3 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
              />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" aria-hidden="true" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim() || !phone.trim() || addMutation.isPending}
            aria-label="Add shelter contact"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {addMutation.isPending ? "Adding..." : "Add Contact"}
          </button>
        </div>

        {/* Contact list */}
        <div className="space-y-2">
          {contacts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
              <div className="text-2xl mb-2">🏠</div>
              <p className="text-sm text-slate-400">No contacts yet.</p>
              <p className="mt-1 text-xs text-slate-600">Add up to 5 people who should know you're safe.</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-500/20">
                  <span className="text-sm font-bold text-emerald-400">{contact.name[0].toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white truncate">{contact.name}</div>
                  <div className="text-xs text-slate-400">{formatDisplay(contact.phone)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMutation.mutate(contact.id)}
                  disabled={removeMutation.isPending}
                  aria-label={`Remove ${contact.name}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-950/40 text-red-400 transition-colors hover:bg-red-900/60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))
          )}
        </div>

        {contacts.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Send a text</div>
            <SafetyTextActions />
          </div>
        )}
        {contacts.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              aria-label="Export contacts backup"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Import contacts from backup"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              Import backup
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" aria-hidden="true" />
          </div>
        )}

        {/* Privacy note */}
        <div className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-slate-500">
            Contacts are stored only on this device. Emergency and I&apos;m Safe texts only go out when you tap a button, then Send in Messages.
          </p>
        </div>

      </div>
      </div>
      <BottomTab />
    </div>
  );
}