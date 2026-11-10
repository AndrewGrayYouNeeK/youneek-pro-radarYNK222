export default function LoadError({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4" role="alert">
      <p className="text-sm text-slate-200">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Retry
        </button>
      )}
    </div>
  );
}
