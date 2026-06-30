import { RISK_LEGEND } from "../../utils/dengueStats";

export default function Legend() {
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4 sm:p-5 space-y-4">
      <div>
        <h3 className="text-sm font-medium text-zinc-200">Risk levels</h3>
        <p className="text-xs text-zinc-500 mt-1">
          Map colours reflect each district&apos;s assigned risk for the selected week.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {RISK_LEGEND.district.map((item) => (
          <div key={item.label} className="flex gap-3">
            <span
              className="mt-1 h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <div>
              <p className="text-sm text-zinc-300">{item.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{item.rule}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-800/50 pt-4">
        <p className="text-xs font-medium text-zinc-400">National risk summary</p>
        <ul className="mt-2 space-y-1">
          {RISK_LEGEND.national.map((line) => (
            <li key={line} className="text-xs text-zinc-500 leading-relaxed">
              · {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
