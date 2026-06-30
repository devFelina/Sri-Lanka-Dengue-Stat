interface WeeklyOverviewProps {
  week: string;
  districts: {
    name: string;
    cases: number;
    cumulative: number;
  }[];
}

export default function WeeklyOverview({
  week,
  districts,
}: WeeklyOverviewProps) {
  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-medium text-zinc-100">Weekly report</h2>
          <p className="text-xs text-zinc-500 mt-1">{week}</p>
        </div>
        <p className="text-[11px] text-zinc-500">
          Cumulative = season total · This week = new cases
        </p>
      </div>

      <div className="mt-4 hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-2 text-[11px] uppercase tracking-wide text-zinc-500">
        <span>District</span>
        <span className="text-right w-24">Cumulative</span>
        <span className="text-right w-20">This week</span>
      </div>

      <div className="mt-2 divide-y divide-zinc-800/50">
        {districts.map((district, index) => (
          <div
            key={district.name}
            className="grid grid-cols-[1fr_auto_auto] gap-3 sm:gap-4 items-center py-3 px-1"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-zinc-600 tabular-nums w-5">
                {index + 1}
              </span>
              <span className="text-sm text-zinc-200 truncate">{district.name}</span>
            </div>

            <div className="text-right w-20 sm:w-24">
              <p className="text-sm tabular-nums text-zinc-400">{district.cumulative}</p>
              <p className="text-[10px] text-zinc-600 sm:hidden">cumul.</p>
            </div>

            <div className="text-right w-16 sm:w-20">
              <p className="text-sm tabular-nums font-medium text-zinc-100">
                {district.cases}
              </p>
              <p className="text-[10px] text-zinc-600 sm:hidden">week</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
