import type { DistrictMetrics } from "../../types/dengue";

interface DistrictComparisonCardProps {
  districtName: string;
  weekA: DistrictMetrics;
  weekB: DistrictMetrics;
  labelA: string;
  labelB: string;
}

function MetricRow({
  label,
  valueA,
  valueB,
}: {
  label: string;
  valueA: string | number;
  valueB: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-sky-300 tabular-nums">{valueA}</span>
        <span className="text-zinc-600">→</span>
        <span className="text-violet-300 tabular-nums">{valueB}</span>
      </div>
    </div>
  );
}

export default function DistrictComparisonCard({
  districtName,
  weekA,
  weekB,
  labelA,
  labelB,
}: DistrictComparisonCardProps) {
  const caseChange = weekB.cases - weekA.cases;
  const cumulativeChange = weekB.cumulative - weekA.cumulative;

  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Selected district
          </p>
          <h3 className="text-lg font-medium text-zinc-100 mt-1">{districtName}</h3>
        </div>
        <div className="text-right text-sm">
          <p className="text-zinc-500">{labelA} → {labelB}</p>
          <p
            className={`mt-1 font-medium ${
              caseChange >= 0 ? "text-red-300" : "text-green-300"
            }`}
          >
            {caseChange >= 0 ? "+" : ""}
            {caseChange} weekly cases
          </p>
        </div>
      </div>

      <div className="mt-4">
        <MetricRow label="Weekly cases" valueA={weekA.cases} valueB={weekB.cases} />
        <MetricRow
          label="Cumulative"
          valueA={weekA.cumulative}
          valueB={weekB.cumulative}
        />
        <MetricRow
          label="Cumulative change"
          valueA="—"
          valueB={cumulativeChange >= 0 ? `+${cumulativeChange}` : cumulativeChange}
        />
        <MetricRow label="Risk" valueA={weekA.risk} valueB={weekB.risk} />
        <MetricRow
          label="Rainfall"
          valueA={`${weekA.rain.toFixed(1)} mm`}
          valueB={`${weekB.rain.toFixed(1)} mm`}
        />
      </div>
    </div>
  );
}
