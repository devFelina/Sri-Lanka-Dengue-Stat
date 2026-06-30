import type { DistrictMetrics } from "../../types/dengue";
import WeatherIndicator from "./WeatherIndicator";

interface DistrictDetailsProps {
  districtName: string | null;
  metrics: DistrictMetrics | null;
  previousMetrics?: DistrictMetrics | null;
}

function StatRow({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string | number;
  subValue?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-zinc-800/50 last:border-0">
      <span className="text-sm text-zinc-500">{label}</span>
      <div className="text-right">
        <p className="text-sm text-zinc-100 tabular-nums">{value}</p>
        {subValue && (
          <p className="text-[11px] text-zinc-600 mt-0.5">{subValue}</p>
        )}
      </div>
    </div>
  );
}

export default function DistrictDetails({
  districtName,
  metrics,
  previousMetrics,
}: DistrictDetailsProps) {
  if (!districtName || !metrics) {
    return (
      <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-5 min-h-[280px] flex items-center justify-center">
        <p className="text-sm text-zinc-500 text-center px-4">
          Tap a district on the map to view cases, cumulative totals, and weather.
        </p>
      </div>
    );
  }

  const caseChange = previousMetrics
    ? metrics.cases - previousMetrics.cases
    : null;
  const cumulativeChange = previousMetrics
    ? metrics.cumulative - previousMetrics.cumulative
    : null;

  const riskColors = {
    High: "text-red-300",
    Medium: "text-amber-300",
    Low: "text-green-300",
  };

  return (
    <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4 sm:p-5 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">District</p>
        <h2 className="text-lg font-medium text-zinc-100 mt-1">{districtName}</h2>
        <p className={`text-sm mt-1 ${riskColors[metrics.risk]}`}>
          {metrics.risk} risk
        </p>
      </div>

      <div>
        <StatRow
          label="Weekly cases"
          value={metrics.cases}
          subValue={
            caseChange !== null
              ? `Previous week: ${previousMetrics?.cases} (${caseChange >= 0 ? "+" : ""}${caseChange})`
              : undefined
          }
        />
        <StatRow
          label="Cumulative total"
          value={metrics.cumulative.toLocaleString()}
          subValue={
            cumulativeChange !== null && previousMetrics
              ? `Was ${previousMetrics.cumulative.toLocaleString()} (${cumulativeChange >= 0 ? "+" : ""}${cumulativeChange})`
              : "Running total for the reporting period"
          }
        />
      </div>

      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
          Weather this week
        </p>
        <WeatherIndicator
          rain={metrics.rain}
          temp={metrics.temp}
          humidity={metrics.humidity}
        />
      </div>
    </div>
  );
}
