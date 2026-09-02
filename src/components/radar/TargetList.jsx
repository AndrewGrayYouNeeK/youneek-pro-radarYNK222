import { Trash2 } from "lucide-react";

const TYPE_SYMBOLS = {
  surface: "□",
  air: "△",
  subsurface: "▽",
  unknown: "◇",
};

const THEME_TEXT = {
  green: "text-chart-2",
  amber: "text-chart-4",
  blue: "text-chart-1",
};

export default function TargetList({ targets, settings, onTargetClick, onDeleteTarget }) {
  const textColor = THEME_TEXT[settings.theme] || "text-green-400";

  return (
    <div className="max-h-36 overflow-y-auto rounded-xl border border-white/10">
      <div className={`px-3 py-2 text-xs font-mono font-bold tracking-widest ${textColor} border-b border-gray-700`}>
        CONTACTS ({targets.length})
      </div>
      {targets.length === 0 && (
        <div className="px-3 py-4 text-gray-600 text-xs font-mono text-center">
          NO CONTACTS PLOTTED<br />Click radar to add
        </div>
      )}
      <ul>
        {targets.map((target) => (
          <li
            key={target.id}
            className="flex items-center justify-between px-3 py-2 border-b border-gray-800 hover:bg-gray-800 cursor-pointer group"
            onClick={() => onTargetClick(target)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`font-mono text-base ${textColor}`}>
                {TYPE_SYMBOLS[target.type] || "◇"}
              </span>
              <div className="min-w-0">
                <div className={`font-mono text-xs font-bold ${textColor} truncate`}>
                  {target.callsign}
                </div>
                <div className="text-gray-500 text-xs font-mono">
                  {target.bearing.toString().padStart(3, "0")}° / {target.range}nm
                </div>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteTarget(target.id); }}
              className="text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}