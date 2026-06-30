import type { WeeklyDataPayload } from "../../types/dengue";

interface WeeklyComparisonChartProps {
  weekA: WeeklyDataPayload | null;
  weekB: WeeklyDataPayload | null;
  labelA: string;
  labelB: string;
  selectedDistricts?: string[];
}

export default function WeeklyComparisonChart({
  weekA,
  weekB,
  labelA,
  labelB,
  selectedDistricts = [],
}: WeeklyComparisonChartProps) {
  if (!weekA || !weekB) {
    return (
      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-5 text-sm text-zinc-500">
        Select two weeks to compare case totals.
      </div>
    );
  }

  const districtNames = Array.from(
    new Set([
      ...Object.keys(weekA.districts),
      ...Object.keys(weekB.districts),
    ])
  );

  const rows = districtNames
    .map((name) => ({
      name,
      casesA: weekA.districts[name]?.cases ?? 0,
      casesB: weekB.districts[name]?.cases ?? 0,
      cumulativeA: weekA.districts[name]?.cumulative ?? 0,
      cumulativeB: weekB.districts[name]?.cumulative ?? 0,
    }))
    .sort(
      (a, b) => Math.max(b.casesA, b.casesB) - Math.max(a.casesA, a.casesB)
    );

  // Group by selected districts first, followed by top other districts
  let rowsToShow = [];
  if (selectedDistricts && selectedDistricts.length > 0) {
    const selectedRows = rows.filter((row) => selectedDistricts.includes(row.name));
    const remainingRows = rows.filter((row) => !selectedDistricts.includes(row.name));
    // Show all selected, then fill with top remaining up to a max of 10
    rowsToShow = [
      ...selectedRows,
      ...remainingRows.slice(0, Math.max(0, 10 - selectedRows.length)),
    ];
  } else {
    rowsToShow = rows.slice(0, 10);
  }

  const maxCases = Math.max(
    ...rowsToShow.flatMap((row) => [row.casesA, row.casesB]),
    1
  );

  const totalA = Object.values(weekA.districts).reduce(
    (sum, district) => sum + district.cases,
    0
  );
  const totalB = Object.values(weekB.districts).reduce(
    (sum, district) => sum + district.cases,
    0
  );

  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-medium text-zinc-100">Case comparison</h2>
          <p className="text-xs text-zinc-500 mt-1">
            {selectedDistricts.length > 0
              ? `Showing compared districts and other top districts`
              : "Top districts by weekly cases — tap the map to add or remove"}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs">
          <div>
            <p className="text-zinc-500">{labelA}</p>
            <p className="text-zinc-200 tabular-nums mt-0.5">{totalA} cases</p>
          </div>
          <div>
            <p className="text-zinc-500">{labelB}</p>
            <p className="text-zinc-200 tabular-nums mt-0.5">{totalB} cases</p>
          </div>
          <div>
            <p className="text-zinc-500">Change</p>
            <p
              className={`tabular-nums mt-0.5 ${
                totalB - totalA >= 0 ? "text-red-350" : "text-green-300"
              }`}
            >
              {totalB - totalA >= 0 ? "+" : ""}
              {totalB - totalA}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-[11px] text-zinc-500 mb-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-8 rounded-sm bg-sky-500/80" />
          {labelA}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-8 rounded-sm bg-violet-500/80" />
          {labelB}
        </div>
      </div>

      {/* Graphical representation (Vertical Bar Chart) */}
      <div className="flex items-stretch mt-4 bg-zinc-950/20 rounded-lg border border-zinc-900/60 p-4 overflow-hidden">
        {/* Sticky Y-Axis (Left) */}
        <div className="w-12 shrink-0 flex flex-col justify-between text-[10px] text-zinc-500 font-mono pr-2 pb-14 border-r border-zinc-800/60 h-[260px] text-right select-none">
          <span>{maxCases}</span>
          <span>{Math.round(maxCases * 0.75)}</span>
          <span>{Math.round(maxCases * 0.5)}</span>
          <span>{Math.round(maxCases * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Scrollable Chart content (Right) */}
        <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <div className="min-w-[640px] flex flex-col">
            {/* Bars Area */}
            <div className="relative h-[210px] flex items-end justify-around px-4 pb-1">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1 pr-4">
                <div className="w-full border-t border-zinc-800/20 h-0" />
                <div className="w-full border-t border-zinc-800/20 h-0" />
                <div className="w-full border-t border-zinc-800/20 h-0" />
                <div className="w-full border-t border-zinc-800/20 h-0" />
                <div className="w-full border-t border-zinc-850 h-0" /> {/* Bottom axis line */}
              </div>

              {/* Columns */}
              {rowsToShow.map((row) => {
                const isSelected = selectedDistricts.includes(row.name);
                const change = row.casesB - row.casesA;

                return (
                  <div
                    key={row.name}
                    className="flex flex-col items-center justify-end h-full w-[54px] sm:w-[68px] relative group/col z-10"
                  >
                    {/* Selection Highlight Panel */}
                    {isSelected && (
                      <div className="absolute inset-x-0.5 inset-y-0 bg-zinc-800/20 ring-1 ring-zinc-700/30 rounded-md z-0" />
                    )}

                    {/* Twin Bars */}
                    <div className="flex items-end gap-1.5 h-full z-10 pt-2 pb-0.5">
                      {/* Bar A */}
                      <div
                        className="w-2.5 sm:w-3.5 bg-sky-500/80 rounded-t-[2px] transition-all duration-300 hover:bg-sky-400 hover:scale-x-105 relative cursor-pointer"
                        style={{ height: `${Math.max((row.casesA / maxCases) * 100, row.casesA > 0 ? 3 : 0)}%` }}
                      />
                      {/* Bar B */}
                      <div
                        className="w-2.5 sm:w-3.5 bg-violet-500/80 rounded-t-[2px] transition-all duration-300 hover:bg-violet-400 hover:scale-x-105 relative cursor-pointer"
                        style={{ height: `${Math.max((row.casesB / maxCases) * 100, row.casesB > 0 ? 3 : 0)}%` }}
                      />
                    </div>

                    {/* Premium Hover Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 hidden group-hover/col:block bg-zinc-950 border border-zinc-800 text-zinc-350 text-[11px] p-3 rounded-lg shadow-2xl z-50 pointer-events-none whitespace-nowrap min-w-[145px]">
                      <p className="font-semibold text-zinc-105 border-b border-zinc-850 pb-1.5 mb-1.5">
                        {row.name}
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-zinc-500">{labelA.split(" ")[0]}</span>
                          <span className="text-sky-400 font-mono font-medium">{row.casesA}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-zinc-500">{labelB.split(" ")[0]}</span>
                          <span className="text-violet-400 font-mono font-medium">{row.casesB}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-zinc-850 pt-1 mt-1 text-[10px]">
                          <span className="text-zinc-500">Weekly Change</span>
                          <span className={`font-mono font-semibold ${change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {change >= 0 ? '+' : ''}{change}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 text-[9px] text-zinc-655 mt-1">
                          <span>Cumulative</span>
                          <span>{row.cumulativeA} → {row.cumulativeB}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Labels Area */}
            <div className="flex justify-around px-4 pt-2 pb-6 border-t border-zinc-800/40 min-w-[640px] h-12">
              {rowsToShow.map((row) => {
                const isSelected = selectedDistricts.includes(row.name);
                return (
                  <div key={row.name} className="w-[54px] sm:w-[68px] flex justify-center shrink-0">
                    <span
                      className={`text-[10px] sm:text-[11px] font-medium whitespace-nowrap -rotate-30 origin-top-left translate-x-1.5 translate-y-1 block transition-colors select-none ${
                        isSelected ? "text-zinc-150 font-bold" : "text-zinc-500"
                      }`}
                    >
                      {row.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
